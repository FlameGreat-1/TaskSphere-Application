from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Notification, NotificationLog, NotificationCategory
import logging
from twilio.rest import Client
from firebase_admin import messaging

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task
def send_notification(notification_id):
    try:
        notification = Notification.objects.get(id=notification_id)
        user_preferences = notification.user.notification_preferences

        if user_preferences.email_notifications:
            send_email_notification(notification)

        if user_preferences.sms_notifications:
            send_sms_notification(notification)

        if user_preferences.push_notifications:
            send_push_notification(notification)

    except Notification.DoesNotExist:
        logger.error(f"Notification with id {notification_id} does not exist.")
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")

def send_email_notification(notification):
    try:
        send_mail(
            subject=notification.title,
            message=notification.message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notification.user.email],
            fail_silently=False,
        )
        log_notification(notification, 'email', 'success')
    except Exception as e:
        logger.error(f"Error sending email notification: {str(e)}")
        log_notification(notification, 'email', 'failed', str(e))

def send_sms_notification(notification):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"{notification.title}: {notification.message}",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=notification.user.phone_number
        )
        log_notification(notification, 'sms', 'success')
    except Exception as e:
        logger.error(f"Error sending SMS notification: {str(e)}")
        log_notification(notification, 'sms', 'failed', str(e))

def send_push_notification(notification):
    try:
        device_token = notification.user.device_token
        
        message = messaging.Message(
            notification=messaging.Notification(
                title=notification.title,
                body=notification.message,
            ),
            token=device_token,
        )
        
        response = messaging.send(message)
        log_notification(notification, 'push', 'success')
    except Exception as e:
        logger.error(f"Error sending push notification: {str(e)}")
        log_notification(notification, 'push', 'failed', str(e))

def log_notification(notification, method, status, error_message=''):
    NotificationLog.objects.create(
        notification=notification,
        delivery_method=method,
        status=status,
        error_message=error_message
    )

@shared_task
def send_daily_digest():
    users_with_digest = User.objects.filter(notification_preferences__daily_digest=True)
    
    try:
        daily_digest_category = NotificationCategory.objects.get(name='daily_digest')
    except NotificationCategory.DoesNotExist:
        logger.error("Daily digest notification category does not exist.")
        return
    
    for user in users_with_digest:
        unread_notifications = Notification.objects.filter(user=user, read_at__isnull=True)
        if unread_notifications.exists():
            digest_content = "Your daily notification digest:\n\n"
            for notif in unread_notifications:
                digest_content += f"- {notif.title}: {notif.message}\n"
            
            digest_notification = Notification.objects.create(
                user=user,
                category=daily_digest_category,
                title='Daily Notification Digest',
                message=digest_content,
                priority='low'
            )
            send_notification.delay(digest_notification.id)

@shared_task
def clean_old_notifications():
    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
    deleted_count = Notification.objects.filter(created_at__lt=thirty_days_ago).delete()[0]
    logger.info(f"Deleted {deleted_count} old notifications.")

@shared_task
def generate_weekly_report():
    end_date = timezone.now().date()
    start_date = end_date - timezone.timedelta(days=7)
    
    for user in User.objects.all():
        completed_tasks = user.tasks.filter(
            is_completed=True, 
            completed_at__range=[start_date, end_date]
        ).count()
        
        new_tasks = user.tasks.filter(
            created_at__range=[start_date, end_date]
        ).count()
        
        report_notification = Notification.objects.create(
            user=user,
            category=NotificationCategory.objects.get(name='weekly_report'),
            title='Your Weekly TaskSphere Report',
            message=f"This week you completed {completed_tasks} tasks and created {new_tasks} new tasks.",
            priority='low'
        )
        send_notification.delay(report_notification.id)

@shared_task
def cleanup_deleted_notifications():
    from django_celery_beat.models import PeriodicTask
    from json import loads
    
    for task in PeriodicTask.objects.filter(task='Notifications.tasks.send_notification'):
        args = loads(task.args)
        if args and not Notification.objects.filter(id=args[0]).exists():
            task.delete()
            logger.info(f"Deleted periodic task for non-existent notification {args[0]}")
