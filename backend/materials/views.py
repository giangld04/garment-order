from django.db.models import F
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import IsOrderManager
from .models import Material, MaterialUsage
from .serializers import MaterialSerializer, MaterialUsageSerializer


class MaterialViewSet(viewsets.ModelViewSet):
    """Full CRUD for materials. Accessible to order_manager and admin roles."""
    queryset = Material.objects.select_related('supplier').all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated, IsOrderManager]
    search_fields = ['code', 'name']
    filterset_fields = ['supplier']
    ordering_fields = ['name', 'code', 'quantity_in_stock', 'created_at']

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Return materials where quantity_in_stock < min_stock_level."""
        qs = Material.objects.filter(
            quantity_in_stock__lt=F('min_stock_level')
        ).select_related('supplier')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class MaterialUsageViewSet(viewsets.ModelViewSet):
    """Full CRUD for material usages per order."""
    queryset = MaterialUsage.objects.select_related('material', 'order').all()
    serializer_class = MaterialUsageSerializer
    permission_classes = [IsAuthenticated, IsOrderManager]
    filterset_fields = ['order', 'material']
    ordering_fields = ['created_at']
