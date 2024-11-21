from django.urls import path
from .views import UserProfileView, DashboardView


app_name = 'user_profile'


urlpatterns = [
    path('Profile/', UserProfileView.as_view(), name='user_profile'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    # ... other URL patterns ...
]
