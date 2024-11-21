from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile, Task, SubTask

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()

@receiver(pre_save, sender=Task)
def update_task_progress(sender, instance, **kwargs):
    if instance.pk:  # If this is an existing task
        subtasks = SubTask.objects.filter(task=instance)
        if subtasks.exists():
            completed_subtasks = subtasks.filter(completed=True).count()
            total_subtasks = subtasks.count()
            instance.progress = (completed_subtasks / total_subtasks) * 100

@receiver(post_save, sender=SubTask)
def update_task_progress_on_subtask_change(sender, instance, **kwargs):
    task = instance.task
    subtasks = SubTask.objects.filter(task=task)
    completed_subtasks = subtasks.filter(completed=True).count()
    total_subtasks = subtasks.count()
    task.progress = (completed_subtasks / total_subtasks) * 100
    task.save()
