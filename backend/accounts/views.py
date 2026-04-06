from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import (
    UserSerializer,
    CustomTokenObtainPairSerializer,
    UserManagementSerializer,
    UserCreateSerializer,
)
from .permissions import IsAdmin
from .models import User


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint — returns access/refresh tokens plus user data."""
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    """Returns the currently authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserManagementViewSet(ModelViewSet):
    """Admin-only CRUD for user accounts. Prevents self-deletion."""

    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = User.objects.all().order_by('id')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserManagementSerializer

    def update(self, request, *args, **kwargs):
        # Allow optional password update on edit with validation
        password = request.data.get('password')
        if password:
            from django.contrib.auth.password_validation import validate_password
            from django.core.exceptions import ValidationError as DjangoValidationError
            try:
                validate_password(password)
            except DjangoValidationError as e:
                return Response({'password': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
        response = super().update(request, *args, **kwargs)
        if password:
            instance = self.get_object()
            instance.set_password(password)
            instance.save(update_fields=['password'])
        return response

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.pk == request.user.pk:
            return Response(
                {'detail': 'Không thể xóa tài khoản của chính mình.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)
