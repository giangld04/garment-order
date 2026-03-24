from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('ao', 'Áo'),
        ('quan', 'Quần'),
        ('vay', 'Váy'),
        ('do_bo', 'Đồ bộ'),
        ('khac', 'Khác'),
    ]
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    # VND currency - no decimal places needed
    unit_price = models.DecimalField(max_digits=12, decimal_places=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.name}"
