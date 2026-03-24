from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'unit_price', 'is_active', 'created_at']
    list_filter = ['category', 'is_active']
    search_fields = ['code', 'name']
    ordering = ['-created_at']
