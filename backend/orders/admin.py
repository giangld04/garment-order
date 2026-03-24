from django.contrib import admin
from .models import Order, OrderDetail, ProductionProgress


class OrderDetailInline(admin.TabularInline):
    model = OrderDetail
    extra = 0
    fields = ['product', 'quantity', 'unit_price', 'subtotal', 'notes']
    readonly_fields = ['subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'status', 'order_date', 'delivery_date', 'total_amount', 'created_by']
    list_filter = ['status', 'order_date']
    search_fields = ['customer__name']
    inlines = [OrderDetailInline]
    ordering = ['-order_date']


@admin.register(ProductionProgress)
class ProductionProgressAdmin(admin.ModelAdmin):
    list_display = ['order', 'stage', 'status', 'start_date', 'end_date', 'assigned_to']
    list_filter = ['stage', 'status']
    ordering = ['order', 'stage']
