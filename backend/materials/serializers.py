from rest_framework import serializers
from .models import Material, MaterialUsage


class MaterialSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True, default='')

    class Meta:
        model = Material
        fields = '__all__'
        read_only_fields = ['created_at']


class MaterialUsageSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)

    class Meta:
        model = MaterialUsage
        fields = '__all__'
        read_only_fields = ['created_at']
