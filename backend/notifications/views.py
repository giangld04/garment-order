from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import IsAdmin
from .models import Notification, ActivityLog
from .serializers import NotificationSerializer, ActivityLogSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """Notifications for the authenticated user only."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Return number of unread notifications for current user."""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'count': count})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a single notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'ok'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all unread notifications as read for current user."""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'ok'})


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only activity log. Admin only."""
    queryset = ActivityLog.objects.select_related('user').all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_fields = ['entity_type', 'user', 'action']
    search_fields = ['entity_type', 'details']
