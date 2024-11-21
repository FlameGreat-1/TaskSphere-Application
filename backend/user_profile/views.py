from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer
from Tasks.models import Task
from Notifications.models import Notification

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'profile': {
                'bio': profile.bio,
                'location': profile.location,
                'birth_date': profile.birth_date,
                'phone_number': profile.phone_number,
                'date_of_birth': profile.date_of_birth,
                'gender': profile.gender,
                'country': profile.country,
                'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
            }
        })

    def put(self, request):
        user = request.user
        profile = user.profile
        user_serializer = UserProfileSerializer(user, data=request.data.get('user', {}), partial=True)
        profile_serializer = UserProfileSerializer(profile, data=request.data.get('profile', {}), partial=True)
        if user_serializer.is_valid() and profile_serializer.is_valid():
            user_serializer.save()
            profile_serializer.save()
            return Response({
                'user': user_serializer.data,
                'profile': profile_serializer.data
            })
        return Response({
            'user': user_serializer.errors,
            'profile': profile_serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile
        
        tasks = Task.objects.filter(user=user).order_by('-created_at')[:5]
        notifications = Notification.objects.filter(recipient=user).order_by('-created_at')[:5]
        
        context = {
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'profile': {
                'bio': profile.bio,
                'location': profile.location,
                'birth_date': profile.birth_date,
                'phone_number': profile.phone_number,
                'date_of_birth': profile.date_of_birth,
                'gender': profile.gender,
                'country': profile.country,
                'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
            },
            'tasks': [
                {
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'due_date': task.due_date,
                    'status': task.status,
                } for task in tasks
            ],
            'notifications': [
                {
                    'id': notification.id,
                    'message': notification.message,
                    'created_at': notification.created_at,
                    'is_read': notification.read,
                    'notification_type': notification.notification_type,
                } for notification in notifications
            ],
        }
        
        return Response(context)
