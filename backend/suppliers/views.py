from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsOrderManager
from .models import Supplier
from .serializers import SupplierSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    """Full CRUD for suppliers. Accessible to order_manager and admin roles."""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated, IsOrderManager]
    filterset_fields = ['name']
    search_fields = ['name', 'contact_person', 'phone', 'email']
    ordering_fields = ['name', 'created_at']
