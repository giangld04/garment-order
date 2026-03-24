from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'company_name', 'created_at']
    search_fields = ['name', 'phone', 'email', 'company_name']
    ordering = ['-created_at']
