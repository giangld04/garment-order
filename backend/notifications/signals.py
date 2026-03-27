from django.db.models.signals import post_save
from django.dispatch import receiver
from orders.models import Order, ProductionProgress
from accounts.models import User
from .models import Notification


@receiver(post_save, sender=Order)
def order_status_notification(sender, instance, created, **kwargs):
    """Notify admin and order_manager when an order is updated (not created)."""
    try:
        if not created:
            users = User.objects.filter(role__in=['admin', 'order_manager'])
            notifications = [
                Notification(
                    user=user,
                    title=f'Đơn hàng #{instance.id} - {instance.get_status_display()}',
                    message=f'Trạng thái đơn hàng #{instance.id} đã thay đổi thành {instance.get_status_display()}',
                    type='order_status'
                )
                for user in users
            ]
            Notification.objects.bulk_create(notifications)
    except Exception:
        # Never let signal errors break the save operation
        pass


@receiver(post_save, sender=ProductionProgress)
def production_notification(sender, instance, created, **kwargs):
    """Notify admin and production_manager on production progress update (not create)."""
    try:
        if created:
            return
        users = User.objects.filter(role__in=['admin', 'production_manager'])
        notifications = [
            Notification(
                user=user,
                title=f'Cập nhật sản xuất - Đơn #{instance.order_id}',
                message=f'Công đoạn {instance.get_stage_display()} - {instance.get_status_display()}',
                type='production_update'
            )
            for user in users
        ]
        Notification.objects.bulk_create(notifications)
    except Exception:
        pass
