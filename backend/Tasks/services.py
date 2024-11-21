from django.utils import timezone
from dateutil.relativedelta import relativedelta
from .models import Task, RecurringTask

def create_recurring_tasks(task):
    try:
        recurring = task.recurringtask
    except RecurringTask.DoesNotExist:
        return

    if recurring.end_date and recurring.end_date <= timezone.now():
        return

    next_due_date = task.due_date
    
    if recurring.frequency == 'daily':
        next_due_date += relativedelta(days=1)
    elif recurring.frequency == 'weekly':
        next_due_date += relativedelta(weeks=1)
    elif recurring.frequency == 'monthly':
        next_due_date += relativedelta(months=1)
    elif recurring.frequency == 'yearly':
        next_due_date += relativedelta(years=1)

    if not recurring.end_date or next_due_date <= recurring.end_date:
        new_task = Task.objects.create(
            title=task.title,
            description=task.description,
            due_date=next_due_date,
            user=task.user,
            priority=task.priority,
            category=task.category
        )
        new_task.tags.set(task.tags.all())
        
        RecurringTask.objects.create(
            task=new_task,
            frequency=recurring.frequency,
            start_date=recurring.start_date,
            end_date=recurring.end_date
        )

def get_overdue_tasks(user):
    now = timezone.now()
    return Task.objects.filter(user=user, due_date__lt=now, completed=False)

def get_upcoming_tasks(user, days=7):
    now = timezone.now()
    end_date = now + timezone.timedelta(days=days)
    return Task.objects.filter(user=user, due_date__range=[now, end_date], completed=False)
