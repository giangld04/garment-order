from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import make_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extends default JWT login to include user data in response."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class UserManagementSerializer(serializers.ModelSerializer):
    """Serializer for admin user management — list, retrieve, update."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users — password required, stored hashed."""

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active', 'password']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
