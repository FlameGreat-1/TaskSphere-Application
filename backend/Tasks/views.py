import os
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from dateutil.rrule import rrulestr
from django.db.models import Q
from django.conf import settings
from django.db import transaction
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .permissions import IsOwnerOrReadOnly
from Notifications.models import Notification, NotificationCategory
from Notifications.tasks import send_notification
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
import requests
from django.urls import reverse
from .models import Task, SubTask, Category, Tag, TimeLog, Comment, Attachment
from .serializers import (
    TaskSerializer, SubTaskSerializer, TaskCreateSerializer, TaskUpdateSerializer, CategorySerializer, TagSerializer,
    TimeLogSerializer, CommentSerializer, AttachmentSerializer
)

User = get_user_model()

logger = logging.getLogger(__name__)

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print('Serializer errors:', serializer.errors)
            logger.error(f"Task creation failed. Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle main task creation
        task = serializer.save(user=self.request.user)

        # Handle subtasks
        subtasks_data = request.data.get('subtasks', [])
        for subtask_data in subtasks_data:
            SubTask.objects.create(task=task, **subtask_data)

        # Handle category
        category_name = request.data.get('category')
        if category_name:
            category, _ = Category.objects.get_or_create(name=category_name)
            task.category = category
            task.save()

        # Handle tags
        tags_data = request.data.get('tags', [])
        for tag_name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_name)
            task.tags.add(tag)

        # Handle assigned users
        assigned_users = request.data.get('assigned_to', [])
        task.assigned_to.set(assigned_users)

        # NOTIFICATIONS INTEGRATION: Create notification for task creation
        try:
            category, _ = NotificationCategory.objects.get_or_create(name='task_created')
            notification = Notification.objects.create(
                user=request.user,
                category=category,
                title='New Task Created',
                message=f'A new task "{task.title}" has been created.',
                priority='medium',
                content_object=task
            )
            send_notification.delay(notification.id)
        except Exception as e:
            logger.error(f"Failed to create notification for task creation. Error: {str(e)}")

        return Response(serializer.data, status=status.HTTP_201_CREATED)




class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    lookup_url_kwarg = 'task_id'

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Handle the 'completed' status separately
        if 'completed' in request.data:
            instance.is_completed = request.data['completed']
            instance.save()

             # NOTIFICATIONS INTEGRATION: Create notification for task completion
            notification = Notification.objects.create(
                user=request.user,
                category=NotificationCategory.objects.get(name='task_completed'),
                title='Task Completed',
                message=f'Task "{instance.title}" has been marked as completed.',
                priority='low',
                content_object=instance
            )
            send_notification.delay(notification.id)
            
            return Response(self.get_serializer(instance).data)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Handle category update
        category_name = request.data.get('category')
        if category_name:
            category, _ = Category.objects.get_or_create(name=category_name)
            instance.category = category

        # Handle tags update
        tags_data = request.data.get('tags', [])
        if tags_data:
            instance.tags.clear()
            for tag_name in tags_data:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                instance.tags.add(tag)

        # Handle assigned users update
        assigned_users = request.data.get('assigned_to', [])
        if assigned_users:
            instance.assigned_to.set(assigned_users)

        instance.save()

        # NOTIFICATIONS INTEGRATION: Create notification for task update
        notification = Notification.objects.create(
            user=request.user,
            category=NotificationCategory.objects.get(name='task_updated'),
            title='Task Updated',
            message=f'Task "{instance.title}" has been updated.',
            priority='medium',
            content_object=instance
        )
        send_notification.delay(notification.id)


        return Response(serializer.data)


class TaskAssignView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request, task_id):
        task = get_object_or_404(Task, id=task_id, user=request.user)
        user_id = request.data.get('assignee')
        if user_id:
            task.assigned_to.add(user_id)
            task.save()

             # NOTIFICATIONS INTEGRATION: Create notification for task assignment
            assigned_user = User.objects.get(id=user_id)
            notification = Notification.objects.create(
                user=assigned_user,
                category=NotificationCategory.objects.get(name='task_assigned'),
                title='New Task Assigned',
                message=f'You have been assigned to the task "{task.title}".',
                priority='high',
                content_object=task
            )
            send_notification.delay(notification.id)

            return Response({'message': 'Task assigned successfully.'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid assignee.'}, status=status.HTTP_400_BAD_REQUEST)


class TaskFilterView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)
        priority = self.request.query_params.get('priority')
        tag = self.request.query_params.get('tag')
        deadline = self.request.query_params.get('deadline')
        category = self.request.query_params.get('category')

        if priority:
            queryset = queryset.filter(priority=priority)
        if tag:
            queryset = queryset.filter(tags__name=tag)
        if deadline:
            queryset = queryset.filter(due_date__lte=deadline)
        if category:
            queryset = queryset.filter(category__name=category)

        return queryset.distinct()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def filter_tasks(request):
    view = TaskFilterView()
    view.request = request
    queryset = view.get_queryset()
    serializer = TaskSerializer(queryset, many=True)
    return Response(serializer.data)

class SubTaskCreateView(generics.ListCreateAPIView):
    serializer_class = SubTaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        task = get_object_or_404(Task, id=self.kwargs['task_id'], user=self.request.user)
        return SubTask.objects.filter(task=task)

    def perform_create(self, serializer):
        task = get_object_or_404(Task, id=self.kwargs['task_id'], user=self.request.user)
        serializer.save(task=task)

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsOwner])
def delete_category(request, category_id):
    try:
        category = Category.objects.get(id=category_id, user=request.user)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Category.DoesNotExist:
        return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)

class TagListCreateView(generics.ListCreateAPIView):
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsOwner])
def delete_tag(request, tag_id):
    try:
        tag = Tag.objects.get(id=tag_id, user=request.user)
        tag.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Tag.DoesNotExist:
        return Response({'error': 'Tag not found.'}, status=status.HTTP_404_NOT_FOUND)

class TimeLogListCreateView(generics.ListCreateAPIView):
    serializer_class = TimeLogSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        task = Task.objects.get(id=self.kwargs['task_id'], user=self.request.user)
        return TimeLog.objects.filter(task=task)

    def perform_create(self, serializer):
        task = Task.objects.get(id=self.kwargs['task_id'], user=self.request.user)
        serializer.save(task=task)

class CommentCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        task = Task.objects.get(id=self.kwargs['task_id'], user=self.request.user)
        return Comment.objects.filter(task=task)

    def perform_create(self, serializer):
        task = Task.objects.get(id=self.kwargs['task_id'], user=self.request.user)
        serializer.save(task=task, user=self.request.user)

class AttachmentCreateView(generics.ListCreateAPIView):
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        task = Task.objects.get(id=self.kwargs['task_id'], user=self.request.user)
        return Attachment.objects.filter(task=task)

    def perform_create(self, serializer):
        task = Task.objects.get(id=self.kwargs['task_id'], user=self.request.user)
        serializer.save(task=task)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsOwner])
def snooze_reminder(request, task_id):
    try:
        task = Task.objects.get(id=task_id, user=request.user)
        snooze_time = request.data.get('snooze_time', 3)  # Default to 3 minutes
        task.reminder_time = timezone.now() + timedelta(minutes=snooze_time)
        task.save()
        return Response({'message': 'Reminder snoozed.'}, status=status.HTTP_200_OK)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

class TaskReminderView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, task_id):
        from . import send_task_reminder
        try:
            task = Task.objects.get(id=task_id, user=request.user)
            # NOTIFICATIONS INTEGRATION: Create notification for task reminder
            notification = Notification.objects.create(
                user=request.user,
                category=NotificationCategory.objects.get(name='task_reminder'),
                title='Task Reminder',
                message=f'Reminder for task "{task.title}".',
                priority='medium',
                content_object=task
            )
            send_notification.delay(notification.id)

            # Push notification via Firebase Cloud Messaging (FCM)
            self._send_fcm_notification(task)

            # SMS Notification via Twilio
            self._send_sms_notification(task)

            return Response({'message': 'Reminder sent.'}, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

    def _send_fcm_notification(self, task):
        fcm_url = 'https://fcm.googleapis.com/fcm/send'
        headers = {
            'Authorization': f'key={settings.FCM_SERVER_KEY}',
            'Content-Type': 'application/json'
        }
        data = {
            'to': task.user.device_token,
            'notification': {
                'title': 'Task Reminder',
                'body': f'Task "{task.title}" is due soon!',
            }
        }
        requests.post(fcm_url, json=data, headers=headers)

    def _send_sms_notification(self, task):
        twilio_url = 'https://api.twilio.com/2010-04-01/Accounts/{AccountSID}/Messages.json'
        requests.post(
            twilio_url,
            data={
                'To': task.user.phone_number,
                'Message': f'Task Reminder: {task.title} is due soon.',
            },
            headers={'Authorization': 'Bearer your_twilio_api_key'}
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsOwner])
def update_task_progress(request, task_id):
    try:
        task = Task.objects.get(id=task_id, user=request.user)
        progress = request.data.get('progress')
        if progress == 'complete':
            task.is_completed = True
        else:
            task.progress = progress
        task.save()
         # NOTIFICATIONS INTEGRATION: Create notification for task progress update
        notification = Notification.objects.create(
            user=request.user,
            category=NotificationCategory.objects.get(name='task_progress'),
            title='Task Progress Updated',
            message=f'Progress for task "{task.title}" has been updated to {progress}.',
            priority='low',
            content_object=task
            )
        send_notification.delay(notification.id)
        
        return Response({'message': 'Task progress updated.'}, status=status.HTTP_200_OK)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

# Google API Integration Views
def get_google_service(service_name, version, user):
    credentials = Credentials.from_authorized_user_info(user.google_credentials)
    return build(service_name, version, credentials=credentials)

class GoogleAuthView(APIView):
    permission_classes = [IsAuthenticated]

    GOOGLE_CLIENT_SECRETS_FILE = 'C:/Users/USER/Downloads/skilled-nation-404607-db50d00d6ee8.json'

    def get(self, request):
        flow = Flow.from_client_secrets_file(
            self.GOOGLE_CLIENT_SECRETS_FILE,
            scopes=[
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/documents',
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/forms.body'
            ],
            redirect_uri=request.build_absolute_uri(reverse('tasks:google-auth-callback'))
        )
        authorization_url, state = flow.authorization_url(access_type='offline', include_granted_scopes='true')
        request.session['google_auth_state'] = state
        return Response({'authorization_url': authorization_url})

    def get_callback(self, request):
        state = request.session.get('google_auth_state')
        if not state:
            return Response({'error': 'State parameter missing.'}, status=status.HTTP_400_BAD_REQUEST)

        flow = Flow.from_client_secrets_file(
            self.GOOGLE_CLIENT_SECRETS_FILE,
            scopes=[
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/documents',
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/forms.body'
            ],
            state=state,
            redirect_uri=request.build_absolute_uri(reverse('tasks:google-auth-callback'))
        )

        try:
            flow.fetch_token(authorization_response=request.build_absolute_uri())
        except Exception as e:
            return Response({'error': f'Failed to fetch token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        credentials = flow.credentials
        request.user.google_credentials = credentials.to_json()
        request.user.save()

        return Response({'message': 'Google authentication successful.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_google_calendar_event(request, task_id):
    try:
        task = Task.objects.get(id=task_id, user=request.user)
        service = get_google_service('calendar', 'v3', request.user)

        event = {
            'summary': task.title,
            'description': task.description,
            'start': {
                'dateTime': task.start_date.isoformat(),
                'timeZone': 'America/Los_Angeles',
            },
            'end': {
                'dateTime': task.due_date.isoformat(),
                'timeZone': 'America/Los_Angeles',
            },
        }

        service.events().insert(calendarId='primary', body=event).execute()
        return Response({'message': 'Task added to Google Calendar.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_to_google_drive(request, attachment_id):
    try:
        attachment = Attachment.objects.get(id=attachment_id, task__user=request.user)
        service = get_google_service('drive', 'v3', request.user)

        file_metadata = {'name': attachment.file.name}
        media = MediaFileUpload(attachment.file.path, mimetype='application/octet-stream')

        file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        return Response({'message': 'File uploaded to Google Drive.', 'file_id': file.get('id')}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_google_sheet(request):
    try:
        service = get_google_service('sheets', 'v4', request.user)
        spreadsheet = {
            'properties': {
                'title': 'New Task Spreadsheet'
            }
        }
        spreadsheet = service.spreadsheets().create(body=spreadsheet, fields='spreadsheetId').execute()
        return Response({'message': 'Spreadsheet created.', 'spreadsheetId': spreadsheet.get('spreadsheetId')}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_google_document(request):
    try:
        service = get_google_service('docs', 'v1', request.user)
        document = {
            'title': 'New Task Document'
        }
        doc = service.documents().create(body=document).execute()
        return Response({'message': 'Document created.', 'documentId': doc.get('documentId')}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_google_form(request):
    try:
        service = get_google_service('forms', 'v1', request.user)
        form = {
            'title': 'New Task Form',
            'description': 'This form is for task feedback.'
        }
        created_form = service.forms().create(body=form).execute()
        return Response({'message': 'Form created.', 'formId': created_form.get('formId')}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_google_drive_files(request):
    try:
        service = get_google_service('drive', 'v3', request.user)
        results = service.files().list(pageSize=10, fields="nextPageToken, files(id, name)").execute()
        files = results.get('files', [])
        return Response({'files': files}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_google_sheet_data(request, spreadsheet_id):
    try:
        service = get_google_service('sheets', 'v4', request.user)
        result = service.spreadsheets().values().get(spreadsheetId=spreadsheet_id, range='Sheet1!A1:E10').execute()
        values = result.get('values', [])
        return Response({'values': values}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_google_document(request, document_id):
    try:
        service = get_google_service('docs', 'v1', request.user)
        requests = [
            {
                'insertText': {
                    'location': {
                        'index': 1,
                    },
                    'text': 'Hello, world!'
                }
            },
        ]
        service.documents().batchUpdate(documentId=document_id, body={'requests': requests}).execute()
        return Response({'message': 'Document updated successfully.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_questions_to_google_form(request, form_id):
    try:
        service = get_google_service('forms', 'v1', request.user)
        questions = [
            {
                "questionItem": {
                    "question": {
                        "title": "What is your feedback?",
                        "questionItemType": "TEXT",
                        "textQuestion": {}
                    }
                }
            },
        ]
        service.forms().batchUpdate(formId=form_id, body={"requests": questions}).execute()
        return Response({'message': 'Questions added to Google Form.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_google_calendar_events(request):
    try:
        service = get_google_service('calendar', 'v3', request.user)
        events_result = service.events().list(calendarId='primary', maxResults=10, singleEvents=True,
                                              orderBy='startTime').execute()
        events = events_result.get('items', [])
        return Response({'events': events}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_google_drive_file(request, file_id):
    try:
        service = get_google_service('drive', 'v3', request.user)
        service.files().delete(fileId=file_id).execute()
        return Response({'message': 'File deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_google_sheet_data(request, spreadsheet_id):
    """
    Update specific cells in a Google Sheet.
    :param request: The request containing updated values.
    :param spreadsheet_id: The ID of the spreadsheet to update.
    :return: A response indicating the success or failure of the update.
    """
    values = request.data.get('values')  # Expecting a list of lists for batch updates
    if not values:
        return Response({'error': 'No values provided for update.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        service = get_google_service('sheets', 'v4', request.user)
        body = {
            'values': values
        }
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range='Sheet1!A1',  # Specify the range based on your requirements
            valueInputOption='RAW',
            body=body
        ).execute()
        logger.info(f'Spreadsheet {spreadsheet_id} updated successfully.')
        return Response({'message': 'Spreadsheet updated successfully.'}, status=status.HTTP_200_OK)

    except HttpError as e:
        logger.error(f'Failed to update spreadsheet: {e}')
        return Response({'error': 'Failed to update spreadsheet.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        logger.error(f'An unexpected error occurred: {e}')
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_google_calendar_event(request, event_id):
    """
    Update an existing Google Calendar event.
    :param request: The request containing updated event details.
    :param event_id: The ID of the event to update.
    :return: A response indicating the success or failure of the update.
    """
    updated_summary = request.data.get('summary')
    updated_description = request.data.get('description')
    updated_start = request.data.get('start')
    updated_end = request.data.get('end')

    if not any([updated_summary, updated_description, updated_start, updated_end]):
        return Response({'error': 'No update data provided.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        service = get_google_service('calendar', 'v3', request.user)
        event = service.events().get(calendarId='primary', eventId=event_id).execute()

        if updated_summary:
            event['summary'] = updated_summary
        if updated_description:
            event['description'] = updated_description
        if updated_start:
            event['start']['dateTime'] = updated_start
        if updated_end:
            event['end']['dateTime'] = updated_end

        updated_event = service.events().update(calendarId='primary', eventId=event_id, body=event).execute()
        logger.info(f'Event {event_id} updated successfully.')
        return Response({'message': 'Event updated successfully.', 'event': updated_event}, status=status.HTTP_200_OK)

    except HttpError as e:
        logger.error(f'Failed to update event: {e}')
        return Response({'error': 'Failed to update event.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        logger.error(f'An unexpected error occurred: {e}')
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_google_form_responses(request, form_id):
    """
    Retrieve responses for a specific Google Form.
    
    :param request: The HTTP request object
    :param form_id: The ID of the Google Form
    :return: A Response object containing the form responses or an error message
    """
    try:
        service = get_google_service('forms', 'v1', request.user)
        
        # Fetch form details to ensure the form exists and the user has access
        form = service.forms().get(formId=form_id).execute()
        
        # Fetch form responses
        result = service.forms().responses().list(formId=form_id).execute()
        responses = result.get('responses', [])
        
        # Process and structure the responses
        structured_responses = []
        for response in responses:
            answer_data = {}
            for answer in response.get('answers', {}).values():
                question_id = answer.get('questionId')
                text_answers = answer.get('textAnswers', {}).get('answers', [])
                answer_data[question_id] = [a.get('value') for a in text_answers]
            
            structured_responses.append({
                'responseId': response.get('responseId'),
                'createTime': response.get('createTime'),
                'lastSubmittedTime': response.get('lastSubmittedTime'),
                'answers': answer_data
            })
        
        logger.info(f"Successfully retrieved {len(responses)} responses for form {form_id}")
        return Response({
            'formTitle': form.get('info', {}).get('title'),
            'responses': structured_responses
        }, status=status.HTTP_200_OK)
    
    except HttpError as e:
        if e.resp.status == 404:
            logger.warning(f"Form not found or user doesn't have access: {form_id}")
            return Response({'error': 'Form not found or you do not have access to it.'}, 
                            status=status.HTTP_404_NOT_FOUND)
        else:
            logger.error(f"Google API error: {e}")
            return Response({'error': 'An error occurred while fetching form responses.'}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        logger.exception(f"Unexpected error in get_google_form_responses: {e}")
        return Response({'error': 'An unexpected error occurred.'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics_data(request):
    user = request.user
    tasks = Task.objects.filter(user=user)

    total_tasks = tasks.count()
    completed_tasks = tasks.filter(is_completed=True).count()
    pending_tasks = total_tasks - completed_tasks
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    priority_distribution = {
        'high': tasks.filter(priority='high').count(),
        'medium': tasks.filter(priority='medium').count(),
        'low': tasks.filter(priority='low').count()
    }

    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    weekly_data = []

    for i in range(7):
        date = week_start + timedelta(days=i)
        day_tasks = tasks.filter(due_date__date=date)
        weekly_data.append({
            'date': date.strftime('%a'),
            'total': day_tasks.count(),
            'completed': day_tasks.filter(is_completed=True).count()
        })

    data = {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'completion_rate': round(completion_rate, 1),
        'priority_distribution': priority_distribution,
        'weekly_data': weekly_data
    }

    return Response(data)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def calendar_events(self, request):
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        
        if not start or not end:
            return Response({"error": "Both start and end dates are required."}, status=status.HTTP_400_BAD_REQUEST)

        start_date = timezone.make_aware(datetime.fromisoformat(start.rstrip('Z')))
        end_date = timezone.make_aware(datetime.fromisoformat(end.rstrip('Z')))

        tasks = self.get_queryset().filter(
            Q(start_date__range=(start_date, end_date)) |
            Q(due_date__range=(start_date, end_date)) |
            Q(start_date__lte=start_date, due_date__gte=end_date)
        )
        events = []

        for task in tasks:
            if task.recurrence_rule:
                # Handle recurring events
                rule = rrulestr(task.recurrence_rule, dtstart=task.start_date)
                for date in rule.between(start_date, end_date):
                    events.append(self.create_event_dict(task, date))
            else:
                events.append(self.create_event_dict(task))

        return Response(events)

    def create_event_dict(self, task, start_date=None):
        if start_date:
            due_date = start_date + (task.due_date - task.start_date)
        else:
            start_date = task.start_date
            due_date = task.due_date

        return {
            'id': task.id,
            'title': task.title,
            'start': timezone.localtime(start_date).isoformat(),
            'end': timezone.localtime(due_date).isoformat(),
            'allDay': task.all_day,
            'description': task.description,
            'priority': task.priority,
            'is_completed': task.is_completed,
            'color': self.get_event_color(task),
        }

    def get_event_color(self, task):
        if task.is_completed:
            return '#A0A0A0'  # Grey for completed tasks
        elif task.priority == 'high':
            return '#FF4136'  # Red for high priority
        elif task.priority == 'medium':
            return '#FF851B'  # Orange for medium priority
        else:
            return '#2ECC40'  # Green for low priority

    @action(detail=True, methods=['post'])
    def toggle_completion(self, request, pk=None):
        task = self.get_object()
        task.is_completed = not task.is_completed
        task.save()
        # NOTIFICATIONS INTEGRATION: Create notification for task completion toggle
        notification = Notification.objects.create(
            user=request.user,
            category=NotificationCategory.objects.get(name='task_status_changed'),
            title='Task Status Changed',
            message=f'Task "{task.title}" has been marked as {"completed" if task.is_completed else "incomplete"}.',
            priority='medium',
            content_object=task
        )
        send_notification.delay(notification.id)

        return Response(self.create_event_dict(task))

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        task = self.get_object()
        new_start = request.data.get('start')
        new_end = request.data.get('end')

        if not new_start or not new_end:
            return Response({"error": "Both start and end are required."}, status=status.HTTP_400_BAD_REQUEST)

        task.start_date = timezone.make_aware(datetime.fromisoformat(new_start.rstrip('Z')))
        task.due_date = timezone.make_aware(datetime.fromisoformat(new_end.rstrip('Z')))
        task.save()

        # NOTIFICATIONS INTEGRATION: Create notification for task rescheduling
        notification = Notification.objects.create(
            user=request.user,
            category=NotificationCategory.objects.get(name='task_rescheduled'),
            title='Task Rescheduled',
            message=f'Task "{task.title}" has been rescheduled.',
            priority='medium',
            content_object=task
        )
        send_notification.delay(notification.id)

        return Response(self.create_event_dict(task))

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        upcoming_tasks = self.get_queryset().filter(
            start_date__gte=timezone.now(),
            is_completed=False
        ).order_by('start_date')[:5]
        return Response([self.create_event_dict(task) for task in upcoming_tasks])

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        overdue_tasks = self.get_queryset().filter(
            due_date__lt=timezone.now(),
            is_completed=False
        ).order_by('due_date')
        return Response([self.create_event_dict(task) for task in overdue_tasks])

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        total_tasks = self.get_queryset().count()
        completed_tasks = self.get_queryset().filter(is_completed=True).count()
        overdue_tasks = self.get_queryset().filter(
            due_date__lt=timezone.now(),
            is_completed=False
        ).count()

        return Response({
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "overdue_tasks": overdue_tasks,
            "completion_rate": (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
        })
