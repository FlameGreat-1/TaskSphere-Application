from rest_framework import serializers
from .models import Notification, NotificationPreference, NotificationCategory

class NotificationCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationCategory
        fields = ['id', 'name', 'description']

class NotificationSerializer(serializers.ModelSerializer):
    category = NotificationCategorySerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'category', 'title', 'message', 'priority', 'created_at', 'read_at', 'action_url']

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['email_notifications', 'sms_notifications', 'push_notifications', 'daily_digest', 'quiet_hours_start', 'quiet_hours_end']

class BulkNotificationSerializer(serializers.Serializer):
    notifications = NotificationSerializer(many=True)
    mark_as_read = serializers.BooleanField(default=False)
