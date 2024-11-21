from django.urls import path 
from . import views

app_name = 'Notifications'

urlpatterns = [
    # Notification URLs
    path('', views.NotificationViewSet.as_view({'get': 'list', 'post': 'create'}), name='notification-list-create'),
    path('<int:pk>/', views.NotificationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='notification-detail'),
    path('mark_all_read/', views.NotificationViewSet.as_view({'post': 'mark_all_read'}), name='mark-all-read'),
    path('bulk_update/', views.NotificationViewSet.as_view({'post': 'bulk_update'}), name='bulk-update'),
    path('<int:pk>/mark-read/', views.NotificationViewSet.as_view({'post': 'mark_read'}), name='mark-notification-read'),

    path('unread-count/', views.unread_notifications_count, name='unread-notifications-count'),

    # Notification Preference URLs
    path('preferences/', views.NotificationPreferenceViewSet.as_view({'get': 'list', 'post': 'create'}), name='preference-list-create'),
    path('preferences/<int:pk>/', views.NotificationPreferenceViewSet.as_view({'get': 'retrieve', 'put': 'update'}), name='preference-detail'),
    path('preferences/user/', views.NotificationPreferenceViewSet.as_view({'get': 'user_preferences', 'put': 'user_preferences'}), name='user-preferences'),

    # Notification Category URLs
    path('categories/', views.NotificationCategoryViewSet.as_view({'get': 'list', 'post': 'create'}), name='category-list-create'),
    path('categories/<int:pk>/', views.NotificationCategoryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='category-detail'),
]
