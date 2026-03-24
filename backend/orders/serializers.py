from rest_framework import serializers
from .models import Order, OrderDetail, ProductionProgress


class OrderDetailSerializer(serializers.ModelSerializer):
    # Read-only display field for product name
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderDetail
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal', 'notes']
        read_only_fields = ['subtotal']


class OrderSerializer(serializers.ModelSerializer):
    details = OrderDetailSerializer(many=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name', 'created_by', 'created_by_name',
            'order_date', 'delivery_date', 'status', 'total_amount', 'notes',
            'details', 'created_at',
        ]
        read_only_fields = ['total_amount', 'created_by', 'created_at']

    def create(self, validated_data):
        details_data = validated_data.pop('details')
        validated_data['created_by'] = self.context['request'].user
        order = Order.objects.create(**validated_data)
        total = 0
        for detail_data in details_data:
            detail = OrderDetail.objects.create(order=order, **detail_data)
            total += detail.subtotal
        order.total_amount = total
        order.save()
        return order

    def update(self, instance, validated_data):
        details_data = validated_data.pop('details', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if details_data is not None:
            # Replace all existing details with new ones
            instance.details.all().delete()
            total = 0
            for detail_data in details_data:
                detail = OrderDetail.objects.create(order=instance, **detail_data)
                total += detail.subtotal
            instance.total_amount = total
        instance.save()
        return instance


class ProductionProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionProgress
        fields = '__all__'
        read_only_fields = ['updated_at']
