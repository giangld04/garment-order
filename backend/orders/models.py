from django.db import models
from django.conf import settings


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('confirmed', 'Đã xác nhận'),
        ('producing', 'Đang sản xuất'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]
    customer = models.ForeignKey(
        'customers.Customer', on_delete=models.CASCADE, related_name='orders'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_orders'
    )
    order_date = models.DateField(db_index=True)
    delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    # VND currency - no decimal places needed
    total_amount = models.DecimalField(max_digits=15, decimal_places=0, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-order_date']


class OrderDetail(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='details')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=0)
    subtotal = models.DecimalField(max_digits=15, decimal_places=0, default=0)
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'order_details'

    def save(self, *args, **kwargs):
        # Auto-calculate subtotal before saving
        self.subtotal = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class ProductionProgress(models.Model):
    STAGE_CHOICES = [
        ('cutting', 'Cắt'),
        ('sewing', 'May'),
        ('finishing', 'Hoàn thiện'),
        ('quality_check', 'Kiểm tra chất lượng'),
        ('packaging', 'Đóng gói'),
    ]
    STATUS_CHOICES = [
        ('not_started', 'Chưa bắt đầu'),
        ('in_progress', 'Đang thực hiện'),
        ('completed', 'Hoàn thành'),
    ]
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='production_progress')
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    assigned_to = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'production_progress'
        ordering = ['order', 'stage']
        unique_together = ['order', 'stage']
