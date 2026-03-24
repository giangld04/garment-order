from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import IsOrderManager, IsProductionManager
from .models import Order, ProductionProgress
from .serializers import OrderSerializer, ProductionProgressSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """Full CRUD for orders with nested details. Supports date range filtering."""
    queryset = Order.objects.select_related('customer', 'created_by').prefetch_related('details__product')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsOrderManager]
    filterset_fields = ['status', 'customer']
    search_fields = ['customer__name', 'notes']
    ordering_fields = ['order_date', 'total_amount', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        start = self.request.query_params.get('start_date')
        end = self.request.query_params.get('end_date')
        if start:
            qs = qs.filter(order_date__gte=start)
        if end:
            qs = qs.filter(order_date__lte=end)
        return qs


class ProductionProgressViewSet(viewsets.ModelViewSet):
    """Full CRUD for production progress stages. Includes by-order lookup."""
    queryset = ProductionProgress.objects.select_related('order')
    serializer_class = ProductionProgressSerializer
    permission_classes = [IsAuthenticated, IsProductionManager]
    filterset_fields = ['stage', 'status', 'order']
    ordering_fields = ['updated_at']

    @action(detail=False, methods=['get'], url_path='by-order/(?P<order_id>[^/.]+)')
    def by_order(self, request, order_id=None):
        """Return all production progress records for a given order ID."""
        progress = self.queryset.filter(order_id=order_id)
        serializer = self.get_serializer(progress, many=True)
        return Response(serializer.data)
