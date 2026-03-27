from rest_framework import serializers
from .models import Notification, ActivityLog


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['created_at', 'user']


class ActivityLogSerializer(serializers.ModelSerializer):
    # Display username alongside user FK
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = '__all__'
        read_only_fields = ['created_at']
