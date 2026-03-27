from django.contrib import admin
from .models import Material, MaterialUsage


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'unit', 'quantity_in_stock', 'min_stock_level', 'supplier', 'created_at']
    search_fields = ['code', 'name']
    list_filter = ['supplier']


@admin.register(MaterialUsage)
class MaterialUsageAdmin(admin.ModelAdmin):
    list_display = ['order', 'material', 'quantity_used', 'created_at']
    list_filter = ['material']
