from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import serializers
import os

# Validator to check if a date is in the future (for due date validation)
def validate_due_date(value):
    if value.date() < timezone.now().date():
        raise serializers.ValidationError("Due date cannot be in the past.")


# Validator to check if a file's size is within limits
def validate_file_size(file):
    max_file_size = 5 * 1024 * 1024  # 5 MB
    if file.size > max_file_size:
        raise ValidationError("File size exceeds the 5MB limit.")

# Validator to check if a file type is allowed (for attachments)
def validate_file_type(file):
    valid_file_extensions = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.xlsx']
    ext = os.path.splitext(file.name)[1]  # Get file extension
    if ext.lower() not in valid_file_extensions:
        raise ValidationError(f"Unsupported file type. Allowed types: {', '.join(valid_file_extensions)}")

# Validator to check task progress (percentage from 0 to 100)
def validate_task_progress(value):
    if value < 0 or value > 100:
        raise ValidationError("Progress value must be between 0 and 100.")

# Validator to check for valid priority levels (example: High, Medium, Low)
def validate_priority_level(value):
    valid_priorities = ['low', 'medium', 'high']
    if value not in valid_priorities:
        raise ValidationError(f"Priority must be one of {', '.join(valid_priorities)}.")

# Validator to check if a string field has enough characters (for title and description)
def validate_min_length(value, min_length=5):
    if len(value) < min_length:
        raise ValidationError(f"Field must have at least {min_length} characters.")

# Validator to check if the snooze time is within allowed limits (e.g., 5 to 60 minutes)
def validate_snooze_time(value):
    if value < 5 or value > 60:
        raise ValidationError("Snooze time must be between 5 and 60 minutes.")

# Validator to ensure the assignee is not the task owner (to avoid self-assigning tasks)
def validate_assignee(task, user):
    if task.user == user:
        raise ValidationError("You cannot assign the task to yourself.")
