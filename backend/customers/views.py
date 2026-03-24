from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsOrderManager
from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    """Full CRUD for customers. Accessible to order_manager and admin roles."""
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsOrderManager]
    filterset_fields = ['company_name']
    search_fields = ['name', 'phone', 'email', 'company_name']
    ordering_fields = ['name', 'created_at']
