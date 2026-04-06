from django.db import models


class Material(models.Model):
    """Raw material/fabric inventory item."""
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    unit = models.CharField(max_length=20)  # m, kg, cuon, etc.
    quantity_in_stock = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    min_stock_level = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit_price = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    supplier = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='materials',
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'materials'
        ordering = ['name']

    def __str__(self):
        return f'{self.code} - {self.name}'


class MaterialUsage(models.Model):
    """Record of material consumed by an order."""
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='material_usages',
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name='usages',
    )
    quantity_used = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'material_usages'

    def __str__(self):
        return f'Order {self.order_id} - {self.material.name} x {self.quantity_used}'
