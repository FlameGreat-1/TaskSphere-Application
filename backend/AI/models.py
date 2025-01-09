from django.db import models
from django.contrib.auth import get_user_model
from Tasks.models import Task, Project, Tag
from django.conf import settings


User = get_user_model()

class AIModel(models.Model):
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=20)
    description = models.TextField()
    api_key = models.CharField(max_length=100)
    endpoint = models.URLField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} v{self.version}"

class AIPrediction(models.Model):
    PREDICTION_TYPES = [
        ('sentiment', 'Sentiment Analysis'),
        ('completion_time', 'Task Completion Time'),
        ('priority', 'Task Priority'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    model = models.ForeignKey(AIModel, on_delete=models.CASCADE)
    prediction_type = models.CharField(max_length=50, choices=PREDICTION_TYPES)
    prediction = models.JSONField()
    confidence = models.FloatField()
    feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_prediction_type_display()} for Task {self.task.id}"
    

class PeerReview(models.Model):
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_reviews_given')
    reviewee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_reviews_received')
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
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

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_sent_communications')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_received_communications')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True)
    communication_type = models.CharField(max_length=20, choices=COMMUNICATION_TYPES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.get_communication_type_display()} from {self.sender.username} to {self.receiver.username}"



class AIRecommendation(models.Model):
    RECOMMENDATION_TYPES = [
        ('task_suggestion', 'Task Suggestion'),
        ('schedule_optimization', 'Schedule Optimization'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    model = models.ForeignKey(AIModel, on_delete=models.CASCADE)
    recommendation_type = models.CharField(max_length=50, choices=RECOMMENDATION_TYPES)
    recommendation = models.JSONField()
    confidence = models.FloatField()
    is_applied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_recommendation_type_display()} for User {self.user.id}"

class AIFeedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    prediction = models.ForeignKey(AIPrediction, on_delete=models.CASCADE, null=True, blank=True)
    recommendation = models.ForeignKey(AIRecommendation, on_delete=models.CASCADE, null=True, blank=True)
    feedback = models.TextField()
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for {'Prediction' if self.prediction else 'Recommendation'} {self.prediction.id if self.prediction else self.recommendation.id}"
