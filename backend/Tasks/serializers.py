from rest_framework import serializers
from .models import Task, SubTask, Category, Tag, TimeLog, Comment, Attachment, UserProfile
from .validators import (validate_due_date, validate_file_size, validate_file_type,
                         validate_task_progress, validate_priority_level, validate_min_length)
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'google_credentials']
        read_only_fields = ['user']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class SubTaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(validators=[validate_min_length])

    class Meta:
        model = SubTask
        fields = ['id', 'task', 'title', 'completed']
        read_only_fields = ['task']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'user']
        read_only_fields = ['user']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'user']
        read_only_fields = ['user']

class TimeLogSerializer(serializers.ModelSerializer):
    hours_spent = serializers.FloatField(read_only=True)

    class Meta:
        model = TimeLog
        fields = ['id', 'task', 'start_time', 'end_time', 'hours_spent']
        read_only_fields = ['task']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'content', 'task', 'author', 'created_at', 'updated_at']
        read_only_fields = ['task', 'created_at', 'updated_at']

class AttachmentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(validators=[validate_file_size, validate_file_type])

    class Meta:
        model = Attachment
        fields = ['id', 'task', 'file', 'uploaded_at']
        read_only_fields = ['task', 'uploaded_at']

class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubTaskSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    assigned_to = UserSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    timelogs = TimeLogSerializer(many=True, read_only=True)

    title = serializers.CharField(validators=[validate_min_length])
    description = serializers.CharField(validators=[validate_min_length], allow_blank=True)
    priority = serializers.CharField(validators=[validate_priority_level])
    due_date = serializers.DateTimeField(validators=[validate_due_date], allow_null=True)
    progress = serializers.IntegerField(validators=[validate_task_progress])
    all_day = serializers.BooleanField(default=False)
    recurrence_rule = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'priority', 'category', 'tags', 'user', 'assigned_to',
                  'start_date', 'due_date', 'time_spent', 'is_completed', 'recurring', 'recurring_interval',
                  'created_at', 'updated_at', 'progress', 'subtasks', 'comments', 'attachments', 'timelogs',
                  'all_day', 'recurrence_rule']
        read_only_fields = ['user', 'created_at', 'updated_at', 'time_spent']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['start'] = instance.start_date.isoformat() if instance.start_date else None
        representation['end'] = instance.due_date.isoformat() if instance.due_date else None
        representation['allDay'] = instance.all_day
        representation['color'] = self.get_event_color(instance)
        return representation

    def get_event_color(self, task):
        if task.is_completed:
            return '#A0A0A0'  # Grey for completed tasks
        elif task.priority == 'high':
            return '#FF4136'  # Red for high priority
        elif task.priority == 'medium':
            return '#FF851B'  # Orange for medium priority
        else:
            return '#2ECC40'  # Green for low priority

    def create(self, validated_data):
        category_data = self.initial_data.get('category')
        tags_data = self.initial_data.get('tags', [])
        assigned_to_data = self.initial_data.get('assigned_to', [])

        task = Task.objects.create(**validated_data)

        if category_data:
            category, _ = Category.objects.get_or_create(name=category_data)
            task.category = category

        for tag_name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_name)
            task.tags.add(tag)

        for user_id in assigned_to_data:
            user = User.objects.get(id=user_id)
            task.assigned_to.add(user)

        task.save()
        return task

    def update(self, instance, validated_data):
        category_data = self.initial_data.get('category')
        tags_data = self.initial_data.get('tags', [])
        assigned_to_data = self.initial_data.get('assigned_to', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if category_data:
            category, _ = Category.objects.get_or_create(name=category_data)
            instance.category = category

        instance.tags.clear()
        for tag_name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_name)
            instance.tags.add(tag)

        instance.assigned_to.clear()
        for user_id in assigned_to_data:
            user = User.objects.get(id=user_id)
            instance.assigned_to.add(user)

        instance.save()
        return instance

class TaskCreateSerializer(TaskSerializer):
    class Meta(TaskSerializer.Meta):
        read_only_fields = ['user', 'created_at', 'updated_at', 'time_spent', 'is_completed', 'progress']

class TaskUpdateSerializer(TaskSerializer):
    class Meta(TaskSerializer.Meta):
        read_only_fields = ['user', 'created_at', 'updated_at', 'time_spent']
