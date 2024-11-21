from django.db import models
from django.utils import timezone
from django.conf import settings
from .validators import (validate_due_date, validate_file_size, validate_file_type,
                         validate_task_progress, validate_priority_level, validate_snooze_time, validate_min_length)

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    google_credentials = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.user.username

# Category for tasks
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categories',
        null=True,
        blank=True
    )
    def __str__(self):
        return self.name

# Tag for tasks
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tags',
        null=True,
        blank=True
    )
    def __str__(self):
        return self.name

# Task model
class Task(models.Model):
    PRIORITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]

    progress = models.IntegerField(default=0)
    title = models.CharField(max_length=200, validators=[validate_min_length])
    description = models.TextField(blank=True, validators=[validate_min_length])
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', validators=[validate_priority_level])
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='tasks')
    tags = models.ManyToManyField(Tag, related_name='tasks', blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_tasks')
    assigned_to = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='assigned_tasks', blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True, validators=[validate_due_date])
    time_spent = models.DurationField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    recurring = models.BooleanField(default=False)
    recurring_interval = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly')
    ], blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    progress = models.IntegerField(default=0)
    progress = models.IntegerField(default=0, validators=[validate_task_progress])
    status = models.CharField(max_length=50, default='pending') 
    all_day = models.BooleanField(default=False)  
    recurrence_rule = models.CharField(max_length=200, blank=True, null=True) 


    def __str__(self):
        return self.title

# SubTask model
class SubTask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=200, validators=[validate_min_length])
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

# TimeLog model for time tracking
class TimeLog(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='timelogs')
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)

    @property
    def hours_spent(self):
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds() / 3600
        return 0

# The Comment model, which relates to the Task model
class Comment(models.Model):
    content = models.TextField()
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Comment by {self.author} on {self.task}"

    class Meta:
        ordering = ['-created_at']

# Attachment model for file uploads
class Attachment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/', validators=[validate_file_size, validate_file_type])
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for {self.task.title}"
