import random
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.utils import timezone
from datetime import timedelta
from faker import Faker
from Tasks.models import Project, Task, Workflow, UserProductivity, ResourceAllocation, TaskDependency, TaskSentiment, Category, Tag, SubTask, TimeLog, Comment, Attachment, PeerReview, Communication

User = get_user_model()
fake = Faker()

def create_demo_data(num_users=10, num_projects=30):
    def create_unique_user(i):
        attempts = 0
        while attempts < 10:  # Limit the number of attempts to avoid infinite loop
            try:
                username = f'demo_user_{i}_{fake.random_int(min=1000, max=9999)}'
                user = User.objects.create_user(
                    username=username,
                    email=f'{username}@example.com',
                    password='demo_password',
                    first_name=fake.first_name(),
                    last_name=fake.last_name()
                )
                return user
            except IntegrityError:
                attempts += 1
        raise Exception(f"Failed to create a unique user after multiple attempts for index {i}")

    # Create demo users
    demo_users = []
    for i in range(num_users):
        user = create_unique_user(i)
        demo_users.append(user)

    # Create categories and tags
    categories = []
    for name in ['Work', 'Personal', 'Study', 'Health', 'Finance']:
        category, created = Category.objects.get_or_create(name=name)
        categories.append(category)

    tags = []
    for name in ['Urgent', 'Important', 'Long-term', 'Quick', 'Collaborative']:
        tag, created = Tag.objects.get_or_create(name=name)
        tags.append(tag)

    # Project statuses and task statuses
    project_statuses = ['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled']
    task_statuses = ['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled']
    task_priorities = ['low', 'medium', 'high', 'urgent']

    # Create projects
    projects = []
    for i in range(num_projects):
        project = Project.objects.create(
            name=fake.catch_phrase(),
            description=fake.paragraph(),
            user=random.choice(demo_users),
            status=random.choice(project_statuses),
            start_date=timezone.now() - timedelta(days=random.randint(30, 365)),
            end_date=timezone.now() + timedelta(days=random.randint(30, 365)),
            is_completed=random.choice([True, False]),
            efficiency_score=random.uniform(0.5, 1.0),
            resource_allocation=random.uniform(0.3, 1.0),
            complexity_score=random.uniform(0.1, 0.9),
            ai_risk_assessment=random.uniform(0.1, 0.9),
            ai_success_prediction=random.uniform(0.1, 1.0)
        )
        projects.append(project)

    # Create tasks
    tasks = []
    for project in projects:
        for j in range(random.randint(5, 25)):  # Each project has 5 to 25 tasks
            start_date = project.start_date + timedelta(days=random.randint(1, 30))
            estimated_time = timedelta(hours=random.randint(1, 100))
            status = random.choice(task_statuses)
            
            task = Task.objects.create(
                title=fake.sentence(nb_words=6),
                description=fake.paragraph(),
                project=project,
                user=random.choice(demo_users),
                status=status,
                priority=random.choice(task_priorities),
                start_date=start_date,
                due_date=start_date + timedelta(days=random.randint(1, 60)),
                time_spent=estimated_time * random.uniform(0.5, 1.5) if status == 'completed' else None,
                category=random.choice(categories),
                progress=random.randint(0, 100),
                ai_complexity_score=random.uniform(0.1, 1.0),
                ai_estimated_duration=random.uniform(1, 100)
)

            task.tags.set(random.sample(tags, k=random.randint(1, 3)))
            task.assigned_to.set(random.sample(demo_users, k=random.randint(1, 3)))
            tasks.append(task)

            # Create subtasks
            for _ in range(random.randint(2, 5)):
                SubTask.objects.create(
                    task=task,
                    title=fake.sentence(nb_words=4),
                    completed=random.choice([True, False])
                )

            # Create time logs
            for _ in range(random.randint(1, 5)):
                TimeLog.objects.create(
                    task=task,
                    start_time=timezone.make_aware(fake.date_time_this_year()),
                    end_time=timezone.make_aware(fake.date_time_this_year())
                )


            # Create comments
            for _ in range(random.randint(0, 3)):
                Comment.objects.create(
                    task=task,
                    author=random.choice(demo_users).username,
                    content=fake.paragraph()
                )

            # Create attachments
            for _ in range(random.randint(0, 2)):
                Attachment.objects.create(
                    task=task,
                    file=f"demo_attachment_{fake.file_name()}"
                )

    # Create task dependencies
    for task in tasks:
        if random.random() < 0.3:  # 30% chance of having a dependency
            possible_dependencies = [t for t in tasks if t.project == task.project and t != task]
            if possible_dependencies:
                dependency = random.choice(possible_dependencies)
                TaskDependency.objects.create(
                    task=task,
                    dependency=dependency,
                    dependency_type=random.choice(['start_to_start', 'start_to_finish', 'finish_to_start', 'finish_to_finish'])
                )

    # Create workflows
    for project in projects:
        Workflow.objects.create(
            name=f"Workflow for {project.name}",
            description=fake.paragraph(),
            user=project.user,
            project=project,
            efficiency_score=random.uniform(0.5, 1.0),
            complexity_score=random.uniform(0.1, 0.9),
            estimated_duration=timedelta(days=random.randint(30, 365)),
            automation_potential=random.uniform(0.0, 1.0),
            bottleneck_score=random.uniform(0.0, 1.0),
            optimization_score=random.uniform(0.0, 1.0)
        )

    # Create user productivity data
    for user in demo_users:
        start_date = timezone.now() - timedelta(days=90)
        for day in range(90):  # 90 days of productivity data
            try:
                UserProductivity.objects.create(
                    user=user,
                    date=start_date + timedelta(days=day),
                    tasks_completed=random.randint(0, 10),
                    hours_worked=random.uniform(4.0, 12.0),
                    productivity_score=random.uniform(0.5, 1.0),
                    ai_productivity_insights=fake.paragraph()
                )
            except IntegrityError:
                continue


    # Create resource allocation data
    resources = ['Time', 'Budget', 'Manpower', 'Equipment', 'Software Licenses']
    for project in projects:
        for resource in resources:
            ResourceAllocation.objects.create(
                project=project,
                resource_type=resource,
                allocated_amount=random.uniform(1000, 10000),
                used_amount=random.uniform(0, 10000),
                ai_optimization_suggestion=fake.sentence()
            )

    # Create task sentiment data
    sentiment_labels = ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive']
    for task in tasks:
        TaskSentiment.objects.create(
            task=task,
            sentiment_score=random.uniform(-1.0, 1.0),
            sentiment_label=random.choice(sentiment_labels),
            analysis_date=timezone.now() - timedelta(days=random.randint(0, 30)),
            ai_sentiment_analysis=fake.paragraph()
        )

    # Create peer reviews
    for task in random.sample(tasks, k=int(len(tasks) * 0.3)):  # 30% of tasks have peer reviews
        PeerReview.objects.create(
            reviewer=random.choice(demo_users),
            reviewee=task.user,
            task=task,
            rating=random.randint(1, 5),
            comment=fake.paragraph()
        )

    # Create communications
    communication_types = ['email', 'chat', 'video', 'voice']
    for _ in range(int(num_projects * 5)):  # 5 communications per project on average
        Communication.objects.create(
            sender=random.choice(demo_users),
            receiver=random.choice(demo_users),
            project=random.choice(projects),
            task=random.choice(tasks) if random.random() < 0.5 else None,
            communication_type=random.choice(communication_types),
            content=fake.paragraph(),
            is_read=random.choice([True, False])
        )

    print(f"Comprehensive demo data created successfully! Created {num_users} users and {num_projects} projects.")

# Call the function to create demo data
if __name__ == "__main__":
    create_demo_data()
