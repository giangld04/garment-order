from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('order_manager', 'Quản lý đơn hàng'),
        ('production_manager', 'Quản lý sản xuất'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='order_manager')
    phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'
