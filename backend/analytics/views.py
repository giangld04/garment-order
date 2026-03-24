from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
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
