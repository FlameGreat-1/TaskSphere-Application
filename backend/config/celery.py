from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.signals import setup_logging, worker_process_init
from django.conf import settings
import logging
from redis import Redis
from redis.exceptions import ConnectionError
import time
import platform

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Redis connection with automatic reconnection
class RedisWrapper:
    def __init__(self, url, max_retries=5, retry_delay=5):
        self.url = url
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.client = None

    def get_client(self):
        if self.client is None:
            self.connect()
        return self.client

    def connect(self):
        for attempt in range(self.max_retries):
            try:
                self.client = Redis.from_url(self.url)
                self.client.ping()
                logging.info("Successfully connected to Redis")
                return
            except ConnectionError:
                logging.warning(f"Failed to connect to Redis (attempt {attempt + 1}/{self.max_retries})")
                time.sleep(self.retry_delay)
        raise ConnectionError("Failed to connect to Redis after multiple attempts")

redis_wrapper = RedisWrapper(os.environ.get('REDIS_URL', 'redis://localhost:6379'))

@worker_process_init.connect
def init_worker_process(sender=None, conf=None, **kwargs):
    redis_wrapper.connect()

# Create the Celery app
app = Celery('config')

# Configure Celery using Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

# Configure Celery logging
@setup_logging.connect
def config_loggers(*args, **kwargs):
    from logging.config import dictConfig
    dictConfig(settings.LOGGING)

# Define a default task base class with error handling
class DefaultTask(app.Task):
    abstract = True

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logging.error(f'Task {task_id} failed: {exc}', exc_info=True)

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        logging.warning(f'Task {task_id} retrying: {exc}')

    def on_success(self, retval, task_id, args, kwargs):
        logging.info(f'Task {task_id} completed successfully')

app.Task = DefaultTask

# Configure Celery beat schedule for periodic tasks
app.conf.beat_schedule = {
    'update-task-priorities': {
        'task': 'tasks.tasks.update_task_priorities',
        'schedule': 3600.0,  # every hour
    },
    'send-task-reminders': {
        'task': 'tasks.tasks.send_task_reminders',
        'schedule': 86400.0,  # daily
    },
    'check-overdue-tasks': {
        'task': 'tasks.tasks.check_overdue_tasks',
        'schedule': 86400.0,  # daily
    },
    'send-daily-digest': {
        'task': 'notifications.tasks.send_daily_digest',
        'schedule': 86400.0,  # daily
    },
    'clean-old-notifications': {
        'task': 'notifications.tasks.clean_old_notifications',
        'schedule': 604800.0,  # weekly
    },
    'generate-weekly-report': {
        'task': 'notifications.tasks.generate_weekly_report',
        'schedule': 604800.0,  # weekly
    },
    'check-redis-connection': {
        'task': 'config.celery.check_redis_connection',
        'schedule': 30.0,  # every 30 seconds
    },
}
app.conf.beat_schedule['cleanup-deleted-notifications'] = {
    'task': 'Notifications.tasks.cleanup_deleted_notifications',
    'schedule': 3600.0,  # run every hour
}

# Additional Celery configurations
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_time_limit=600,  # 10 minutes
    task_soft_time_limit=300,  # 5 minutes
    worker_max_tasks_per_child=200,
    broker_connection_retry_on_startup=True,
    broker_url=redis_wrapper.url,
    result_backend=redis_wrapper.url,
    broker_connection_retry=True,
    broker_connection_max_retries=None,  # Retry indefinitely
    task_default_retry_delay=60,  # 1 minute delay before retrying
    task_max_retries=3,  # Maximum number of retries
    flower_port=5555,  # For monitoring with Flower
)


if platform.system() == 'Windows':
    app.conf.update(
        broker_connection_retry_on_startup=True,
        broker_connection_max_retries=None,
        worker_pool='solo',
    )


# Optional: Define some utility functions
@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

@app.task
def check_redis_connection():
    try:
        redis_wrapper.get_client().ping()
        logging.info("Redis connection is healthy")
    except ConnectionError:
        logging.error("Redis connection failed")

if __name__ == '__main__':
    app.start()
