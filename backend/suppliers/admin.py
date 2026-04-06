from django.contrib import admin
from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'phone', 'email', 'tax_code', 'created_at']
    search_fields = ['name', 'contact_person', 'phone', 'email', 'tax_code']
    ordering = ['-created_at']
