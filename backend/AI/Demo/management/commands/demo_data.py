from django.core.management.base import BaseCommand
from ...demo_data_seeder import create_demo_data

class Command(BaseCommand):
    help = 'Creates comprehensive demo data for the application'

    def add_arguments(self, parser):
        parser.add_argument('--users', type=int, default=10, help='Number of demo users to create')
        parser.add_argument('--projects', type=int, default=30, help='Number of demo projects to create')

    def handle(self, *args, **options):
        num_users = options['users']
        num_projects = options['projects']
        
        self.stdout.write(self.style.SUCCESS(f'Creating {num_users} demo users and {num_projects} demo projects...'))
        create_demo_data(num_users, num_projects)
        self.stdout.write(self.style.SUCCESS('Successfully created comprehensive demo data'))
