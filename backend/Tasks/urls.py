from django.urls import path
from . import views

app_name = 'Tasks'

urlpatterns = [
    # Task URLs
    path('tasks/', views.TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:task_id>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<int:task_id>/assign/', views.TaskAssignView.as_view(), name='task-assign'),
    path('tasks/<int:task_id>/progress/', views.update_task_progress, name='task-progress-update'),
    path('tasks/filter/', views.TaskFilterView.as_view(), name='task-filter'),
    path('tasks/filter-func/', views.filter_tasks, name='task-filter-func'),
    

    # Analytics URL
    path('tasks/analytics/', views.get_analytics_data, name='analytics-data'),

    # Calendar URL
    path('tasks/calendar-events/', views.TaskViewSet.as_view({'get': 'calendar_events'}), name='calendar-events'),


    # Subtask URLs
    path('tasks/<int:task_id>/subtasks/', views.SubTaskCreateView.as_view(), name='subtask-list-create'),

    # Category URLs
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),

    # Tag URLs
    path('tags/', views.TagListCreateView.as_view(), name='tag-list-create'),

    # TimeLog URLs
    path('tasks/<int:task_id>/timelogs/', views.TimeLogListCreateView.as_view(), name='timelog-list-create'),

    # Comment URLs
    path('tasks/<int:task_id>/comments/', views.CommentCreateView.as_view(), name='comment-list-create'),

    # Attachment URLs
    path('tasks/<int:task_id>/attachments/', views.AttachmentCreateView.as_view(), name='attachment-list-create'),

    # Reminder URLs
    path('tasks/<int:task_id>/snooze/', views.snooze_reminder, name='snooze-reminder'),
    path('tasks/<int:task_id>/reminder/', views.TaskReminderView.as_view(), name='task-reminder'),

    # Google Authentication
    path('google/auth/', views.GoogleAuthView.as_view(), name='google-auth'),
    path('google/callback/', views.GoogleAuthView.as_view(), name='google-auth-callback'),

    # Google Calendar
    path('tasks/<int:task_id>/google-calendar/', views.create_google_calendar_event, name='create-google-calendar-event'),
    path('google/calendar/events/', views.list_google_calendar_events, name='list-google-calendar-events'),
    path('google/calendar/events/<str:event_id>/', views.update_google_calendar_event, name='update-google-calendar-event'),

    # Google Drive
    path('attachments/<int:attachment_id>/google-drive/', views.upload_to_google_drive, name='upload-to-google-drive'),
    path('google/drive/files/', views.list_google_drive_files, name='list-google-drive-files'),
    path('google/drive/files/<str:file_id>/', views.delete_google_drive_file, name='delete-google-drive-file'),

    # Google Sheets
    path('google/sheets/', views.create_google_sheet, name='create-google-sheet'),
    path('google/sheets/<str:spreadsheet_id>/', views.get_google_sheet_data, name='get-google-sheet-data'),
    path('google/sheets/<str:spreadsheet_id>/update/', views.update_google_sheet_data, name='update-google-sheet-data'),

    # Google Docs
    path('google/docs/', views.create_google_document, name='create-google-document'),
    path('google/docs/<str:document_id>/', views.update_google_document, name='update-google-document'),

    # Google Forms
    path('google/forms/', views.create_google_form, name='create-google-form'),
    path('google/forms/<str:form_id>/questions/', views.add_questions_to_google_form, name='add-questions-to-google-form'),
    path('google/forms/<str:form_id>/responses/', views.get_google_form_responses, name='get-google-form-responses'),
]
