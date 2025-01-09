from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .serializers import AIPredictionSerializer, AIRecommendationSerializer, AIFeedbackSerializer
from .models import AIPrediction, AIRecommendation, AIFeedback
from .services import EnhancedAIService
from Tasks.models import Task, Project
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


class AIPredictionViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = AIPrediction.objects.all()
    serializer_class = AIPredictionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def provide_feedback(self, request, pk=None):
        prediction = self.get_object()
        serializer = AIFeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, prediction=prediction)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AIRecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = AIRecommendation.objects.all()
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def apply_recommendation(self, request, pk=None):
        recommendation = self.get_object()
        ai_service = EnhancedAIService()
        result = ai_service.apply_recommendation(recommendation)
        if result:
            recommendation.is_applied = True
            recommendation.save()
            return Response({'status': 'recommendation applied successfully'})
        return Response({'status': 'failed to apply recommendation'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def provide_feedback(self, request, pk=None):
        recommendation = self.get_object()
        serializer = AIFeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, recommendation=recommendation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AIServiceViewSet(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ai_service = EnhancedAIService()

    @action(detail=False, methods=['post'])
    def generate_task_suggestions(self, request):
        suggestions = self.ai_service.generate_task_suggestions(request.user)
        return Response(suggestions)

    @action(detail=False, methods=['post'])
    def optimize_schedule(self, request):
        optimized_schedule = self.ai_service.optimize_user_schedule(request.user)
        return Response(optimized_schedule)

    @action(detail=False, methods=['post'])
    def analyze_task_sentiment(self, request):
        task_id = request.data.get('task_id')
        if not task_id:
            return Response({'error': 'task_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        task = get_object_or_404(Task, id=task_id, user=request.user)
        sentiment = self.ai_service.analyze_task_sentiment(task)
        return Response({'sentiment': sentiment})

    @action(detail=False, methods=['post'])
    def predict_task_completion_time(self, request):
        task_id = request.data.get('task_id')
        if not task_id:
            return Response({'error': 'task_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        task = get_object_or_404(Task, id=task_id, user=request.user)
        completion_time = self.ai_service.predict_task_completion_time(task)
        return Response({'estimated_completion_time': completion_time})

    @action(detail=False, methods=['post'])
    def predict_task_priority(self, request):
        task_id = request.data.get('task_id')
        if not task_id:
            return Response({'error': 'task_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        task = get_object_or_404(Task, id=task_id, user=request.user)
        priority = self.ai_service.predict_task_priority(task)
        return Response({'predicted_priority': priority})

    @action(detail=False, methods=['post'])
    def create_task_with_nlp(self, request):
        text = request.data.get('text')
        if not text:
            return Response({'error': 'text is required'}, status=status.HTTP_400_BAD_REQUEST)
        task = self.ai_service.create_task_with_nlp(request.user, text)
        return Response({'task_id': task.id, 'title': task.title})

    @action(detail=False, methods=['post'])
    def get_workflow_suggestions(self, request):
        suggestions = self.ai_service.get_workflow_suggestions(request.user)
        return Response(suggestions)

    @action(detail=False, methods=['post'])
    def optimize_project_resources(self, request):
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        project = get_object_or_404(Project, id=project_id, user=request.user)
        allocation = self.ai_service.optimize_project_resources(project)
        return Response(allocation)

    @action(detail=False, methods=['post'])
    def analyze_task_dependencies(self, request):
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        project = get_object_or_404(Project, id=project_id, user=request.user)
        dependencies = self.ai_service.analyze_task_dependencies(project)
        return Response(dependencies)

    @action(detail=False, methods=['post'])
    def assess_project_risks(self, request):
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        project = get_object_or_404(Project, id=project_id, user=request.user)
        risks = self.ai_service.assess_project_risks(project)
        return Response(risks)

    @action(detail=False, methods=['post'])
    def suggest_collaborations(self, request):
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        project = get_object_or_404(Project, id=project_id, user=request.user)
        collaborations = self.ai_service.suggest_collaborations(project)
        return Response(collaborations)

    @action(detail=False, methods=['post'])
    def comprehensive_project_analysis(self, request):
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        project = get_object_or_404(Project, id=project_id, user=request.user)
        analysis = self.ai_service.comprehensive_project_analysis(project)
        return Response(analysis)

    @action(detail=False, methods=['post'])
    def generate_ai_insights_report(self, request):
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        project = get_object_or_404(Project, id=project_id, user=request.user)
        report = self.ai_service.generate_ai_insights_report(project)
        return Response(report)




## DEMO DATA

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.core.management import call_command
from django.views.decorators.http import require_POST
from Tasks.models import Project, Task, UserProductivity, PeerReview, Communication, ResourceAllocation
from django.db.models import Avg, Count, Q, F
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum

@login_required
@require_POST
def activate_demo_mode(request):
    try:
        num_users = int(request.POST.get('num_users', 10))
        num_projects = int(request.POST.get('num_projects', 30))
        call_command('create_demo_data', users=num_users, projects=num_projects)
        return JsonResponse({'message': 'Demo mode activated successfully', 'users_created': num_users, 'projects_created': num_projects})
    except Exception as e:
        return JsonResponse({'error': f'Failed to activate demo mode: {str(e)}'}, status=500)

@login_required
def get_ai_insights(request):
    try:
        # Get overall project statistics
        project_stats = Project.objects.aggregate(
            avg_efficiency=Avg('efficiency_score'),
            avg_complexity=Avg('complexity_score'),
            total_projects=Count('id'),
            avg_risk_assessment=Avg('ai_risk_assessment'),
            avg_success_prediction=Avg('ai_success_prediction')
        )

        # Get task statistics
        task_stats = Task.objects.aggregate(
            avg_complexity=Avg('ai_complexity_score'),
            total_tasks=Count('id'),
            completed_tasks=Count('id', filter=Q(status='completed')),
            avg_estimated_duration=Avg('ai_estimated_duration'),
            overdue_tasks=Count('id', filter=Q(due_date__lt=timezone.now(), status__in=['not_started', 'in_progress']))
        )

        # Get user productivity insights
        productivity_insights = UserProductivity.objects.aggregate(
            avg_productivity=Avg('productivity_score'),
            avg_tasks_completed=Avg('tasks_completed'),
            avg_hours_worked=Avg('hours_worked')
        )

        # Get collaboration insights
        collaboration_insights = {
            'avg_peer_review_rating': PeerReview.objects.aggregate(Avg('rating'))['rating__avg'],
            'total_communications': Communication.objects.count(),
            'unread_communications': Communication.objects.filter(is_read=False).count()
        }

        # Get resource allocation insights
        resource_insights = ResourceAllocation.objects.aggregate(
            total_allocated=Sum('allocated_amount'),
            total_used=Sum('used_amount'),
            avg_utilization=Avg(F('used_amount') / F('allocated_amount'))
        )

        # Generate AI recommendations based on insights
        ai_recommendations = generate_ai_recommendations(project_stats, task_stats, productivity_insights, collaboration_insights, resource_insights)

        # Combine all insights
        ai_insights = {
            'project_insights': project_stats,
            'task_insights': task_stats,
            'productivity_insights': productivity_insights,
            'collaboration_insights': collaboration_insights,
            'resource_insights': resource_insights,
            'ai_recommendations': ai_recommendations
        }

        return JsonResponse(ai_insights)
    except Exception as e:
        return JsonResponse({'error': f'Failed to generate AI insights: {str(e)}'}, status=500)
    
@login_required
def generate_ai_recommendations(project_stats, task_stats, productivity_insights, collaboration_insights, resource_insights):
    recommendations = []

    if project_stats['avg_efficiency'] < 0.7:
        recommendations.append("Consider reallocating resources to improve project efficiency.")

    if task_stats['avg_complexity'] > 0.7:
        recommendations.append("Focus on breaking down complex tasks to increase overall productivity.")

    if productivity_insights['avg_productivity'] < 0.6:
        recommendations.append("Implement productivity boosting techniques such as time-boxing or the Pomodoro technique.")

    if collaboration_insights['avg_peer_review_rating'] < 3.5:
        recommendations.append("Enhance team collaboration through regular feedback sessions and team-building activities.")

    if resource_insights['avg_utilization'] > 0.9:
        recommendations.append("Review resource allocation to prevent overutilization and potential burnout.")

    if task_stats['overdue_tasks'] > task_stats['total_tasks'] * 0.2:
        recommendations.append("Prioritize overdue tasks and consider adjusting project timelines.")

    return recommendations
