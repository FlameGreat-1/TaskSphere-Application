from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIPredictionViewSet, AIRecommendationViewSet, AIServiceViewSet

from .views import activate_demo_mode


router = DefaultRouter()
router.register(r'predictions', AIPredictionViewSet, basename='ai-prediction')
router.register(r'recommendations', AIRecommendationViewSet, basename='ai-recommendation')
router.register(r'services', AIServiceViewSet, basename='ai-service')

urlpatterns = [
    path('', include(router.urls)),
    path('predictions/<int:pk>/feedback/', AIPredictionViewSet.as_view({'post': 'provide_feedback'}), name='prediction-feedback'),
    path('recommendations/<int:pk>/apply/', AIRecommendationViewSet.as_view({'post': 'apply_recommendation'}), name='apply-recommendation'),
    path('recommendations/<int:pk>/feedback/', AIRecommendationViewSet.as_view({'post': 'provide_feedback'}), name='recommendation-feedback'),
    path('services/generate-task-suggestions/', AIServiceViewSet.as_view({'post': 'generate_task_suggestions'}), name='generate-task-suggestions'),
    path('services/optimize-schedule/', AIServiceViewSet.as_view({'post': 'optimize_schedule'}), name='optimize-schedule'),
    path('services/analyze-task-sentiment/', AIServiceViewSet.as_view({'post': 'analyze_task_sentiment'}), name='analyze-task-sentiment'),
    path('services/predict-task-completion-time/', AIServiceViewSet.as_view({'post': 'predict_task_completion_time'}), name='predict-task-completion-time'),
    path('services/predict-task-priority/', AIServiceViewSet.as_view({'post': 'predict_task_priority'}), name='predict-task-priority'),
    path('services/create-task-with-nlp/', AIServiceViewSet.as_view({'post': 'create_task_with_nlp'}), name='create-task-with-nlp'),
    path('services/get-workflow-suggestions/', AIServiceViewSet.as_view({'post': 'get_workflow_suggestions'}), name='get-workflow-suggestions'),
    path('services/optimize-project-resources/', AIServiceViewSet.as_view({'post': 'optimize_project_resources'}), name='optimize-project-resources'),
    path('services/analyze-task-dependencies/', AIServiceViewSet.as_view({'post': 'analyze_task_dependencies'}), name='analyze-task-dependencies'),
    path('services/assess-project-risks/', AIServiceViewSet.as_view({'post': 'assess_project_risks'}), name='assess-project-risks'),
    path('services/suggest-collaborations/', AIServiceViewSet.as_view({'post': 'suggest_collaborations'}), name='suggest-collaborations'),
    path('services/comprehensive-project-analysis/', AIServiceViewSet.as_view({'post': 'comprehensive_project_analysis'}), name='comprehensive-project-analysis'),
    path('services/generate-ai-insights-report/', AIServiceViewSet.as_view({'post': 'generate_ai_insights_report'}), name='generate-ai-insights-report'),
    path('generate-task-suggestions/', AIServiceViewSet.as_view({'post': 'generate_task_suggestions'}), name='generate-task-suggestions'),
    path('optimize-schedule/', AIServiceViewSet.as_view({'post': 'optimize_schedule'}), name='optimize-schedule'),
    path('get-workflow-suggestions/', AIServiceViewSet.as_view({'post': 'get_workflow_suggestions'}), name='get-workflow-suggestions'),



    path('activate-demo-mode/', activate_demo_mode, name='activate_demo_mode'),

]
