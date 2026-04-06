from datetime import date
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework import status as http_status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from customers.models import Customer
from orders.models import Order


class DashboardView(APIView):
    """Summary stats: total orders, revenue, customers, pending/producing counts."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {
            'total_orders': Order.objects.count(),
            'total_revenue': (
                Order.objects
                .exclude(status='cancelled')
                .aggregate(total=Sum('total_amount'))['total'] or 0
            ),
            'total_customers': Customer.objects.count(),
            'pending_orders': Order.objects.filter(status='pending').count(),
            'producing_orders': Order.objects.filter(status='producing').count(),
        }
        return Response(data)


class MonthlyRevenueView(APIView):
    """Monthly revenue aggregation (excluding cancelled orders)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = (
            Order.objects
            .exclude(status='cancelled')
            .annotate(month=TruncMonth('order_date'))
            .values('month')
            .annotate(revenue=Sum('total_amount'), count=Count('id'))
            .order_by('month')
        )
        return Response(list(data))


class OrderTrendsView(APIView):
    """Monthly order counts grouped by status."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = (
            Order.objects
            .annotate(month=TruncMonth('order_date'))
            .values('month', 'status')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        return Response(list(data))


class PredictView(APIView):
    """Predict next 3 months of order volume using trained ML model."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .ml_predictor import predict_orders

        earliest = Order.objects.order_by('order_date').first()
        if not earliest:
            return Response({'error': 'No order data available'}, status=http_status.HTTP_400_BAD_REQUEST)

        today = date.today()
        month_num = (
            (today.year - earliest.order_date.year) * 12
            + today.month - earliest.order_date.month
        )
        predictions = predict_orders(month_num)
        if predictions is None:
            return Response(
                {'error': 'Model not trained. Run: python manage.py train_model'},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        # Build predicted month labels (YYYY-MM format)
        result = []
        for pred in predictions:
            offset = pred['month_offset']
            pred_month = today.month - 1 + offset  # 0-indexed
            pred_year = today.year + pred_month // 12
            pred_month_display = pred_month % 12 + 1
            result.append({
                'month': f'{pred_year}-{pred_month_display:02d}',
                'predicted_count': pred['predicted_count'],
                'is_prediction': True,
            })

        return Response({'predictions': result})


class RecommendView(APIView):
    """GET /api/analytics/recommendations/?customer_id=X&top_n=5
    Returns collaborative-filtering product recommendations for a customer.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response({'error': 'customer_id is required'}, status=http_status.HTTP_400_BAD_REQUEST)
        try:
            customer_id = int(customer_id)
        except ValueError:
            return Response({'error': 'customer_id must be an integer'}, status=http_status.HTTP_400_BAD_REQUEST)

        top_n = int(request.query_params.get('top_n', 5))
        try:
            customer = Customer.objects.get(pk=customer_id)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=http_status.HTTP_404_NOT_FOUND)

        from .recommender import get_recommendations
        result = get_recommendations(customer_id, top_n=top_n)

        if 'error' in result:
            return Response(result, status=http_status.HTTP_400_BAD_REQUEST)

        return Response({
            'customer_id': customer_id,
            'customer_name': customer.name,
            **result,
        })


class ExportExcelView(APIView):
    """Stream orders as .xlsx — supports ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .export_excel import export_orders_excel
        start = request.query_params.get('start_date')
        end = request.query_params.get('end_date')
        return export_orders_excel(start, end)


class ExportPdfView(APIView):
    """Stream orders as .pdf — supports ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .export_pdf import export_orders_pdf
        start = request.query_params.get('start_date')
        end = request.query_params.get('end_date')
        return export_orders_pdf(start, end)


class ProductPotentialView(APIView):
    """GET /api/analytics/product-potential/
    Returns ML-scored product potential ranking for catalog/production decisions.
    Query params: ?top_n=10&category=ao
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        import os, joblib
        MODEL_PATH = os.path.join(
            os.path.dirname(__file__), '..', 'ml_models', 'product_potential.joblib'
        )
        if not os.path.exists(MODEL_PATH):
            return Response(
                {'error': 'Model not trained. Run: python manage.py train_product_potential'},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        data = joblib.load(MODEL_PATH)
        df = data['results']

        category = request.query_params.get('category')
        if category:
            df = df[df['category'] == category]

        top_n = int(request.query_params.get('top_n', 10))
        df = df.head(top_n)

        results = []
        for _, row in df.iterrows():
            results.append({
                'rank':            int(row['rank']),
                'product_id':      int(row['product_id']),
                'name':            row['name'],
                'category':        row['category'],
                'potential_score': float(row['potential_score']),
                'growth_rate':     round(float(row['growth_rate']), 4),
                'trend_slope':     round(float(row['trend_slope']), 2),
                'recent_qty':      int(row['recent_qty']),
                'order_breadth':   round(float(row['order_breadth']), 4),
            })

        return Response({
            'generated_at': data['generated_at'],
            'products': results,
        })
