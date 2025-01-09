from django.db import models
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
import json
from .validators import (validate_due_date, validate_file_size, validate_file_type,
                         validate_task_progress, validate_priority_level, validate_snooze_time, validate_min_length)

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    google_credentials = models.TextField(null=True, blank=True)
    years_of_experience = models.IntegerField(default=0)
    workload = models.FloatField(default=0.0)

    def __str__(self):
        return self.user.username

    def set_google_credentials(self, data):
        self.google_credentials = json.dumps(data)

    def get_google_credentials(self):
        return json.loads(self.google_credentials) if self.google_credentials else None

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


class Project(models.Model):
    name = models.CharField(max_length=200, validators=[validate_min_length])
    description = models.TextField(blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_projects')
    status = models.CharField(max_length=20, choices=[('ongoing', 'Ongoing'), ('completed', 'Completed')], default='ongoing')
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True, validators=[validate_due_date])
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    efficiency_score = models.FloatField(null=True, blank=True)
    resource_allocation = models.FloatField(null=True, blank=True)
    complexity = models.FloatField(null=True, blank=True)
    complexity_score = models.FloatField(null=True, blank=True)
    estimated_duration = models.DurationField(null=True, blank=True)
    ai_risk_assessment = models.FloatField(null=True, blank=True)
    ai_success_prediction = models.FloatField(null=True, blank=True)
    priority = models.CharField(max_length=20, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium')
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    type = models.CharField(max_length=100, default='')
    market_volatility = models.FloatField(null=True, blank=True)
    economic_growth = models.FloatField(null=True, blank=True)
    industry_disruption_level = models.FloatField(null=True, blank=True)
    risk_level = models.CharField(max_length=50, default='medium')
    collaboration_score = models.FloatField(null=True, blank=True)
    team_structure = models.CharField(max_length=100, default='')
    team = models.ManyToManyField(get_user_model(), related_name='team_projects', blank=True)
    meeting_frequency = models.IntegerField(default=0)
    meeting_types = models.TextField(default='[]')

    def __str__(self):
        return self.name

    def set_meeting_types(self, types):
        self.meeting_types = json.dumps(types)

    def get_meeting_types(self):
        try:
            return json.loads(self.meeting_types)
        except json.JSONDecodeError:
            return [] 


class Workflow(models.Model):
    name = models.CharField(max_length=200, validators=[validate_min_length])
    description = models.TextField(blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workflows')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='workflows', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    efficiency_score = models.FloatField(null=True, blank=True)
    complexity_score = models.FloatField(null=True, blank=True)
    estimated_duration = models.DurationField(null=True, blank=True)
    automation_potential = models.FloatField(null=True, blank=True)
    bottleneck_score = models.FloatField(null=True, blank=True)
    optimization_score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name

class Skill(models.Model):
    name = models.CharField(max_length=100)
    proficiency_level = models.IntegerField()

    def __str__(self):
        return self.name

class UserProductivity(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='productivity_records')
    date = models.DateField()
    tasks_completed = models.IntegerField(default=0)
    hours_worked = models.FloatField(default=0.0)
    role = models.CharField(max_length=100, default='')
    department = models.CharField(max_length=100, default='')
    communication_preference = models.CharField(max_length=50, default='')
    collaboration_score = models.FloatField(null=True, blank=True)
    skills = models.ManyToManyField(Skill)
    productivity_score = models.FloatField(default=0.0)
    ai_productivity_insights = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username}'s productivity on {self.date}"

class Task(models.Model):
    PRIORITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]

    title = models.CharField(max_length=200, validators=[validate_min_length])
    description = models.TextField(blank=True, validators=[validate_min_length])
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', validators=[validate_priority_level])
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='tasks')
    tags = models.ManyToManyField(Tag, related_name='tasks', blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    workflow = models.ForeignKey(Workflow, on_delete=models.SET_NULL, related_name='tasks', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_tasks')
    assigned_to = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='assigned_tasks', blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True, validators=[validate_due_date])
    time_spent = models.DurationField(null=True, blank=True)
    completion_time = models.DurationField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    recurring = models.BooleanField(default=False)
    recurring_interval = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly')
    ], blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    progress = models.IntegerField(default=0, validators=[validate_task_progress])
    status = models.CharField(max_length=50, default='pending')
    all_day = models.BooleanField(default=False)
    recurrence_rule = models.CharField(max_length=200, blank=True, null=True)
    ai_complexity_score = models.FloatField(null=True, blank=True)
    ai_estimated_duration = models.FloatField(null=True, blank=True)
    complexity = models.FloatField(null=True, blank=True)
    estimated_hours = models.FloatField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

class SubTask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=200, validators=[validate_min_length])
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class TimeLog(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='timelogs')
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)

    @property
    def hours_spent(self):
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds() / 3600
        return 0

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

class Attachment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/', validators=[validate_file_size, validate_file_type])
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for {self.task.title}"

class PeerReview(models.Model):
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_reviews_given')
    reviewee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_reviews_received')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='peer_reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review by {self.reviewer.username} for {self.reviewee.username} on Task {self.task.id}"

class Communication(models.Model):
    COMMUNICATION_TYPES = [
        ('email', 'Email'),
        ('chat', 'Chat'),
        ('video', 'Video Call'),
        ('voice', 'Voice Call'),
    ]

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_sent_communications')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_received_communications')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='communications')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name='communications')
    communication_type = models.CharField(max_length=20, choices=COMMUNICATION_TYPES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.get_communication_type_display()} from {self.sender.username} to {self.receiver.username}"

class ResourceAllocation(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='resource_allocations')
    resource_type = models.CharField(max_length=100)
    allocated_amount = models.FloatField()
    used_amount = models.FloatField(default=0)
    ai_optimization_suggestion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.resource_type} allocation for {self.project.name}"

class TaskSentiment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='sentiments')
    sentiment_score = models.FloatField()
    sentiment_label = models.CharField(max_length=20)
    analysis_date = models.DateTimeField(default=timezone.now)
    ai_sentiment_analysis = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Sentiment for Task {self.task.id}: {self.sentiment_label}"

class TaskDependency(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='dependencies')
    dependency = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='dependent_tasks')
    dependency_type = models.CharField(max_length=20, choices=[
        ('start_to_start', 'Start to Start'),
        ('start_to_finish', 'Start to Finish'),
        ('finish_to_start', 'Finish to Start'),
        ('finish_to_finish', 'Finish to Finish')
    ])

    def __str__(self):
        return f"{self.task.title} depends on {self.dependency.title} ({self.get_dependency_type_display()})"

class Meeting(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='meetings')
    date = models.DateTimeField()
    type = models.CharField(max_length=50)

    def __str__(self):
        return f"Meeting for {self.project.name} on {self.date}"
