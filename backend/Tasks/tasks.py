
from celery import shared_task
from django.utils import timezone
from .models import Task
from Notifications.models import Notification, NotificationCategory
import datetime
from google.oauth2 import service_account
import googleapiclient.discovery
from googleapiclient.http import MediaFileUpload
import logging
from pyfcm import FCMNotification
from firebase_admin import messaging

logger = logging.getLogger(__name__)


# Google API setup
SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/forms'
]

# Path to the service account JSON file
SERVICE_ACCOUNT_FILE = 'Enter service account json file directory here'

credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)

calendar_service = googleapiclient.discovery.build('calendar', 'v3', credentials=credentials)
sheets_service = googleapiclient.discovery.build('sheets', 'v4', credentials=credentials)
drive_service = googleapiclient.discovery.build('drive', 'v3', credentials=credentials)
docs_service = googleapiclient.discovery.build('docs', 'v1', credentials=credentials)
forms_service = googleapiclient.discovery.build('forms', 'v1', credentials=credentials)

@shared_task
def update_task_priorities():
    tasks = Task.objects.filter(is_completed=False)
    for task in tasks:
        days_until_due = (task.due_date - timezone.now().date()).days
        if days_until_due <= 1:
            task.priority = 'high'
        elif days_until_due <= 3:
            task.priority = 'medium'
        else:
            task.priority = 'low'
        task.save()

@shared_task
def send_task_reminders():
    today = timezone.now().date()
    upcoming_tasks = Task.objects.filter(due_date=today, is_completed=False)
    
    for task in upcoming_tasks:
        reminder_notification = Notification.objects.create(
            user=task.user,
            category=NotificationCategory.objects.get(name='task_reminder'),
            title='Task Due Today',
            message=f"Your task '{task.title}' is due today!",
            priority='high',
            content_object=task
        )
        from notifications.tasks import send_notification
        send_notification.delay(reminder_notification.id)

@shared_task
def check_overdue_tasks():
    logger.info("Checking for overdue tasks")
    overdue_tasks = Task.objects.filter(due_date__lt=timezone.now().date(), is_completed=False)
    
    for task in overdue_tasks:
        try:
            overdue_category = NotificationCategory.objects.get(name='task_overdue')
            overdue_notification = Notification.objects.create(
                user=task.user,
                category=overdue_category,
                title='Task Overdue',
                message=f"Your task '{task.title}' is overdue!",
                priority='high',
                content_object=task
            )
            from notifications.tasks import send_notification
            send_notification.delay(overdue_notification.id)
            logger.info(f"Overdue notification sent for task: {task.id}")
        except NotificationCategory.DoesNotExist:
            logger.error("Task overdue notification category does not exist.")
        except Exception as e:
            logger.error(f"Error creating overdue notification for task {task.id}: {str(e)}")
    
    logger.info(f"Overdue task check completed. {overdue_tasks.count()} overdue tasks found.")

@shared_task
def create_calendar_event(task_id):
    task = Task.objects.get(id=task_id)
    event = {
        'summary': task.title,
        'description': task.description,
        'start': {
            'dateTime': task.due_date.isoformat(),
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': (task.due_date + datetime.timedelta(hours=1)).isoformat(),
            'timeZone': 'UTC',
        },
    }
    
    try:
        event_result = calendar_service.events().insert(calendarId='primary', body=event).execute()
        logger.info(f"Task '{task.title}' created in Google Calendar as event ID {event_result['id']}.")
        return event_result['id']
    except Exception as e:
        logger.error(f"Error creating calendar event for task '{task.title}': {str(e)}")
        return None

@shared_task
def sync_task_with_google_sheets(task_id):
    task = Task.objects.get(id=task_id)
    sheet_id = 'your_google_sheet_id'
    range_name = 'Tasks!A:D'
    
    values = [
        [task.title, task.description, task.due_date.isoformat(), task.priority]
    ]
    
    body = {
        'values': values
    }
    
    try:
        result = sheets_service.spreadsheets().values().append(
            spreadsheetId=sheet_id,
            range=range_name,
            valueInputOption='RAW',
            body=body
        ).execute()
        logger.info(f"Task '{task.title}' synced with Google Sheets. Appended data: {result.get('updates', {}).get('updatedCells', 0)} cells updated.")
        return result
    except Exception as e:
        logger.error(f"Error syncing task '{task.title}' with Google Sheets: {str(e)}")
        return None

@shared_task
def upload_file_to_drive(file_name, mime_type, file_path):
    file_metadata = {
        'name': file_name,
        'mimeType': mime_type
    }
    
    media = MediaFileUpload(file_path, mimetype=mime_type)
    try:
        file = drive_service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        logger.info(f"File uploaded to Drive with ID: {file.get('id')}.")
        return file.get('id')
    except Exception as e:
        logger.error(f"Error uploading file to Drive: {str(e)}")
        return None

@shared_task
def create_google_doc(title, content):
    doc = {
        'title': title
    }
    
    try:
        doc = docs_service.documents().create(body=doc).execute()
        doc_id = doc.get('documentId')

        requests = [
            {
                'insertText': {
                    'location': {
                        'index': 1,
                    },
                    'text': content,
                }
            },
        ]

        docs_service.documents().batchUpdate(documentId=doc_id, body={'requests': requests}).execute()
        logger.info(f"Google Doc created with ID: {doc_id}.")
        return doc_id
    except Exception as e:
        logger.error(f"Error creating Google Doc: {str(e)}")
        return None

@shared_task
def create_google_form(title):
    form = {
        'title': title,
        'description': 'This is a new form created via API.'
    }
    
    try:
        created_form = forms_service.forms().create(body=form).execute()
        logger.info(f"Google Form created with ID: {created_form['formId']}.")
        return created_form['formId']
    except Exception as e:
        logger.error(f"Error creating Google Form: {str(e)}")
        return None

@shared_task
def send_push_notification(task_id):
    task = Task.objects.get(id=task_id)
    if task:
        registration_tokens = [user.device_token for user in task.assigned_to.all() if user.device_token]
        if registration_tokens:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=f"Task Update: {task.title}",
                    body=f"The task '{task.title}' has been updated. Please check it."
                ),
                tokens=registration_tokens,
            )
            try:
                response = messaging.send_multicast(message)
                logger.info(f"Push notification sent for task: {task.id}. Successful: {response.success_count}, Failed: {response.failure_count}")
                return response.success_count
            except Exception as e:
                logger.error(f"Error sending push notification for task {task.id}: {str(e)}")
                return None
    return "Task or users not found."


@shared_task
def track_time_spent_on_task(task_id, start_time, end_time):
    task = Task.objects.get(id=task_id)
    if task:
        time_spent = end_time - start_time
        task.time_spent += time_spent.total_seconds() // 60
        task.save()
        logger.info(f"Tracked time spent on task: {task.title}")
    return f"Tracked time spent on task: {task.title}"
