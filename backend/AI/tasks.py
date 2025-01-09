from celery import shared_task
from .services import AIService
from django.contrib.auth import get_user_model
from Tasks.models import Task, Project, Tag
from .models import AIPrediction, AIRecommendation, AIModel
from django.utils import timezone
from django.db import transaction
import logging
from django.db.models import Count, Avg
from datetime import timedelta

User = get_user_model()
logger = logging.getLogger(__name__)

@shared_task
def analyze_new_tasks():
    ai_service = AIService()
    new_tasks = Task.objects.filter(sentiment__isnull=True)
    
    for task in new_tasks:
        try:
            with transaction.atomic():
                sentiment = ai_service.analyze_task_sentiment(task)
                task.sentiment = sentiment
                task.save()
            logger.info(f"Successfully analyzed sentiment for task {task.id}")
        except Exception as e:
            logger.error(f"Error analyzing sentiment for task {task.id}: {str(e)}")

@shared_task
def generate_task_suggestions_for_users():
    ai_service = AIService()
    users = User.objects.filter(is_active=True)
    
    for user in users:
        try:
            suggestions = ai_service.generate_task_suggestions(user)
            logger.info(f"Generated {len(suggestions)} task suggestions for user {user.id}")
        except Exception as e:
            logger.error(f"Error generating task suggestions for user {user.id}: {str(e)}")

@shared_task
def optimize_user_schedules():
    ai_service = AIService()
    users = User.objects.filter(is_active=True)
    
    for user in users:
        try:
            optimized_schedule = ai_service.optimize_user_schedule(user)
            logger.info(f"Optimized schedule for user {user.id}")
        except Exception as e:
            logger.error(f"Error optimizing schedule for user {user.id}: {str(e)}")

@shared_task
def update_ai_models():
    ai_service = AIService()
    try:
        ai_service.task_completion_model = ai_service._train_task_completion_model()
        ai_service.task_priority_model = ai_service._train_task_priority_model()
        logger.info("Successfully updated AI models")
    except Exception as e:
        logger.error(f"Error updating AI models: {str(e)}")

@shared_task
def clean_old_predictions_and_recommendations():
    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
    AIPrediction.objects.filter(created_at__lt=thirty_days_ago).delete()
    AIRecommendation.objects.filter(created_at__lt=thirty_days_ago).delete()
    logger.info("Cleaned old predictions and recommendations")

@shared_task
def predict_task_completion_times():
    ai_service = AIService()
    open_tasks = Task.objects.filter(status='open', estimated_completion_time__isnull=True)
    
    for task in open_tasks:
        try:
            completion_time = ai_service.predict_task_completion_time(task)
            task.estimated_completion_time = completion_time
            task.save()
            logger.info(f"Predicted completion time for task {task.id}")
        except Exception as e:
            logger.error(f"Error predicting completion time for task {task.id}: {str(e)}")

@shared_task
def predict_task_priorities():
    ai_service = AIService()
    open_tasks = Task.objects.filter(status='open', ai_priority__isnull=True)
    
    for task in open_tasks:
        try:
            priority = ai_service.predict_task_priority(task)
            task.ai_priority = priority
            task.save()
            logger.info(f"Predicted priority for task {task.id}")
        except Exception as e:
            logger.error(f"Error predicting priority for task {task.id}: {str(e)}")

@shared_task
def apply_pending_recommendations():
    pending_recommendations = AIRecommendation.objects.filter(is_applied=False)
    ai_service = AIService()
    
    for recommendation in pending_recommendations:
        try:
            if ai_service.apply_recommendation(recommendation):
                recommendation.is_applied = True
                recommendation.save()
                logger.info(f"Applied recommendation {recommendation.id}")
            else:
                logger.warning(f"Failed to apply recommendation {recommendation.id}")
        except Exception as e:
            logger.error(f"Error applying recommendation {recommendation.id}: {str(e)}")

@shared_task
def analyze_user_productivity():
    users = User.objects.filter(is_active=True)
    for user in users:
        try:
            completed_tasks = Task.objects.filter(user=user, status='completed', completed_at__gte=timezone.now() - timedelta(days=30))
            avg_completion_time = completed_tasks.aggregate(Avg('time_spent'))['time_spent__avg']
            task_count = completed_tasks.count()
            productivity_score = task_count * (1 / avg_completion_time.total_seconds() if avg_completion_time else 1)
            
            AIRecommendation.objects.create(
                user=user,
                model=AIModel.objects.get(name='Productivity Analyzer'),
                recommendation_type='productivity_insight',
                recommendation={
                    'productivity_score': productivity_score,
                    'completed_tasks': task_count,
                    'avg_completion_time': str(avg_completion_time) if avg_completion_time else None
                },
                confidence=0.9
            )
            logger.info(f"Analyzed productivity for user {user.id}")
        except Exception as e:
            logger.error(f"Error analyzing productivity for user {user.id}: {str(e)}")

@shared_task
def suggest_task_collaborations():
    ai_service = AIService()
    projects = Project.objects.annotate(user_count=Count('tasks__user', distinct=True)).filter(user_count__gt=1)
    
    for project in projects:
        try:
            tasks = Task.objects.filter(project=project, status='open')
            for task in tasks:
                collaborators = ai_service.suggest_collaborators(task)
                if collaborators:
                    AIRecommendation.objects.create(
                        user=task.user,
                        model=AIModel.objects.get(name='Collaboration Suggester'),
                        recommendation_type='collaboration_suggestion',
                        recommendation={
                            'task_id': task.id,
                            'suggested_collaborators': collaborators
                        },
                        confidence=0.8
                    )
            logger.info(f"Suggested collaborations for project {project.id}")
        except Exception as e:
            logger.error(f"Error suggesting collaborations for project {project.id}: {str(e)}")

@shared_task
def analyze_task_dependencies():
    ai_service = AIService()
    open_tasks = Task.objects.filter(status='open')
    
    for task in open_tasks:
        try:
            dependencies = ai_service.identify_task_dependencies(task)
            if dependencies:
                AIPrediction.objects.create(
                    user=task.user,
                    task=task,
                    model=AIModel.objects.get(name='Dependency Analyzer'),
                    prediction_type='task_dependencies',
                    prediction={'dependencies': dependencies},
                    confidence=0.85
                )
            logger.info(f"Analyzed dependencies for task {task.id}")
        except Exception as e:
            logger.error(f"Error analyzing dependencies for task {task.id}: {str(e)}")

@shared_task
def generate_project_insights():
    ai_service = AIService()
    projects = Project.objects.all()
    
    for project in projects:
        try:
            insights = ai_service.generate_project_insights(project)
            AIRecommendation.objects.create(
                user=project.user,
                model=AIModel.objects.get(name='Project Insight Generator'),
                recommendation_type='project_insights',
                recommendation=insights,
                confidence=0.9
            )
            logger.info(f"Generated insights for project {project.id}")
        except Exception as e:
            logger.error(f"Error generating insights for project {project.id}: {str(e)}")

@shared_task
def update_tag_relevance():
    ai_service = AIService()
    tags = Tag.objects.all()
    
    for tag in tags:
        try:
            relevance_score = ai_service.calculate_tag_relevance(tag)
            tag.relevance_score = relevance_score
            tag.save()
            logger.info(f"Updated relevance score for tag {tag.id}")
        except Exception as e:
            logger.error(f"Error updating relevance score for tag {tag.id}: {str(e)}")

@shared_task
def generate_productivity_reports():
    ai_service = AIService()
    users = User.objects.filter(is_active=True)
    
    for user in users:
        try:
            report = ai_service.generate_productivity_report(user)
            AIRecommendation.objects.create(
                user=user,
                model=AIModel.objects.get(name='Productivity Reporter'),
                recommendation_type='productivity_report',
                recommendation=report,
                confidence=0.95
            )
            logger.info(f"Generated productivity report for user {user.id}")
        except Exception as e:
            logger.error(f"Error generating productivity report for user {user.id}: {str(e)}")
