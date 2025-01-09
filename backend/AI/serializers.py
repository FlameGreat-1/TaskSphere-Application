from rest_framework import serializers
from .models import AIPrediction, AIRecommendation, AIFeedback, AIModel
from Tasks.models import Task
from django.contrib.auth import get_user_model

User = get_user_model()

class AIModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModel
        fields = ['id', 'name', 'version', 'description', 'is_active', 'created_at', 'updated_at']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class AIPredictionSerializer(serializers.ModelSerializer):
    task = TaskSerializer(read_only=True)
    model = AIModelSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = AIPrediction
        fields = ['id', 'user', 'task', 'model', 'prediction_type', 'prediction', 'confidence', 'feedback', 'created_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['prediction_type'] = instance.get_prediction_type_display()
        return representation

class AIRecommendationSerializer(serializers.ModelSerializer):
    model = AIModelSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = AIRecommendation
        fields = ['id', 'user', 'model', 'recommendation_type', 'recommendation', 'confidence', 'is_applied', 'created_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['recommendation_type'] = instance.get_recommendation_type_display()
        return representation

class AIFeedbackSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = AIFeedback
        fields = ['id', 'user', 'prediction', 'recommendation', 'feedback', 'rating', 'created_at']

    def validate(self, data):
        if not data.get('prediction') and not data.get('recommendation'):
            raise serializers.ValidationError("Either prediction or recommendation must be provided.")
        if data.get('prediction') and data.get('recommendation'):
            raise serializers.ValidationError("Only one of prediction or recommendation should be provided.")
        return data

class DetailedAIPredictionSerializer(AIPredictionSerializer):
    feedback = AIFeedbackSerializer(many=True, read_only=True)

class DetailedAIRecommendationSerializer(AIRecommendationSerializer):
    feedback = AIFeedbackSerializer(many=True, read_only=True)
