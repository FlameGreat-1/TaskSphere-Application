import openai
import spacy
from django.conf import settings
import requests
from .models import AIModel, AIPrediction, AIRecommendation, PeerReview, Communication
from Tasks.models import Task, Project, Tag, Workflow
from django.contrib.auth.models import User
from django.db.models import Avg, Count, Q, F
from django.utils import timezone
from transformers import pipeline
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from scipy.optimize import linear_sum_assignment
from scipy.sparse import hstack
import networkx as nx
from networkx import DiGraph, topological_sort
import numpy as np
import pandas as pd
from typing import List, Dict, Any
import logging
from datetime import datetime, timedelta
from dateutil import parser
from collections import Counter

logger = logging.getLogger(__name__)

openai.api_key = settings.OPENAI_API_KEY


class AIService:
    def __init__(self):
        self.openai_model = AIModel.objects.get(name='GPT-4')
        openai.api_key = self.openai_model.api_key
        self.task_completion_model = self._train_task_completion_model()
        self.task_priority_model = self._train_task_priority_model()

    def generate_task_suggestions(self, user) -> List[Dict[str, Any]]:
        completed_tasks = Task.objects.filter(user=user, status='completed').order_by('-completed_at')[:20]
        task_descriptions = [task.description for task in completed_tasks]
        projects = Project.objects.filter(user=user)
        project_names = [project.name for project in projects]
        
        prompt = f"""
        Based on the following completed tasks: {', '.join(task_descriptions)},
        and considering the user's projects: {', '.join(project_names)},
        suggest 5 new tasks for the user. For each task, provide:
        1. A task description
        2. A suggested project (from the list or a new one)
        3. Estimated priority (High, Medium, Low)
        4. A list of relevant tags
        5. Estimated duration in hours
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "system", "content": "You are a helpful AI assistant for a task management application."},
                          {"role": "user", "content": prompt}],
                max_tokens=500,
                n=1,
                temperature=0.7,
            )
            
            suggestions = self._parse_openai_response(response.choices[0].message['content'])
            
            for suggestion in suggestions:
                AIRecommendation.objects.create(
                    user=user,
                    model=self.openai_model,
                    recommendation_type='task_suggestion',
                    recommendation=suggestion,
                    confidence=0.85  # Assuming a fixed confidence for now
                )
            
            return suggestions
        except Exception as e:
            logger.error(f"Error generating task suggestions: {str(e)}")
            return []

    def _parse_openai_response(self, response: str) -> List[Dict[str, Any]]:
        suggestions = []
        lines = response.strip().split('\n')
        current_suggestion = {}
        for line in lines:
            if line.startswith('1.'):
                if current_suggestion:
                    suggestions.append(current_suggestion)
                current_suggestion = {'description': line[3:].strip()}
            elif line.startswith('2.'):
                current_suggestion['project'] = line[3:].strip()
            elif line.startswith('3.'):
                current_suggestion['priority'] = line[3:].strip()
            elif line.startswith('4.'):
                current_suggestion['tags'] = [tag.strip() for tag in line[3:].split(',')]
            elif line.startswith('5.'):
                current_suggestion['estimated_duration'] = float(line[3:].split()[0])
        if current_suggestion:
            suggestions.append(current_suggestion)
        return suggestions

    def analyze_task_sentiment(self, task: Task) -> str:
        prompt = f"Analyze the sentiment of the following task description: '{task.description}'. Respond with 'positive', 'neutral', or 'negative'."
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "system", "content": "You are a sentiment analysis AI."},
                          {"role": "user", "content": prompt}],
                max_tokens=10,
                n=1,
                temperature=0.3,
            )
            
            sentiment = response.choices[0].message['content'].strip().lower()
            
            AIPrediction.objects.create(
                user=task.user,
                task=task,
                model=self.openai_model,
                prediction_type='sentiment',
                prediction={'sentiment': sentiment},
                confidence=0.9  # Assuming a fixed confidence for now
            )
            
            return sentiment
        except Exception as e:
            logger.error(f"Error analyzing task sentiment: {str(e)}")
            return 'neutral'

    def predict_task_completion_time(self, task: Task) -> float:
        features = self._extract_task_features(task)
        prediction = self.task_completion_model.predict([features])[0]
        confidence = self._calculate_confidence(self.task_completion_model, features)

        AIPrediction.objects.create(
            user=task.user,
            task=task,
            model=self.openai_model,
            prediction_type='completion_time',
            prediction={'completion_time': prediction},
            confidence=confidence
        )

        return prediction

    def predict_task_priority(self, task: Task) -> str:
        features = self._extract_task_features(task)
        prediction = self.task_priority_model.predict([features])[0]
        confidence = self.task_priority_model.predict_proba([features]).max()

        AIPrediction.objects.create(
            user=task.user,
            task=task,
            model=self.openai_model,
            prediction_type='priority',
            prediction={'priority': prediction},
            confidence=confidence
        )

        return prediction

    def _train_task_completion_model(self):
        completed_tasks = Task.objects.filter(status='completed')
        X = [self._extract_task_features(task) for task in completed_tasks]
        y = [(task.completed_at - task.created_at).total_seconds() / 3600 for task in completed_tasks]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
            # Create a preprocessor for categorical variables
        categorical_features = [3, 10]  # Indices of categorical features (category and priority)
        numeric_features = [i for i in range(len(X[0])) if i not in categorical_features]
    
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numeric_features),
                ('cat', OneHotEncoder(drop='first', sparse=False), categorical_features)
            ])
        
         # Create a pipeline with preprocessor and model
        model = Pipeline([
            ('preprocessor', preprocessor),
            ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
        ])

        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        logger.info(f"Task Completion Model - MAE: {mae}, MSE: {mse}")

        return model

    def _train_task_priority_model(self):
        tasks = Task.objects.all()
        X = [self._extract_task_features(task) for task in tasks]
        y = [task.priority for task in tasks]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
         # Create a preprocessor for categorical variables
        categorical_features = [3, 10]  # Indices of categorical features (category and priority)
        numeric_features = [i for i in range(len(X[0])) if i not in categorical_features]
    
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numeric_features),
                ('cat', OneHotEncoder(drop='first', sparse=False), categorical_features)
            ])

        # Create a pipeline with preprocessor and model
        model = Pipeline([
            ('preprocessor', preprocessor),
            ('classifier', MultinomialNB())
        ])

        model.fit(X_train, y_train)

        accuracy = model.score(X_test, y_test)

        logger.info(f"Task Priority Model - Accuracy: {accuracy}")

        return model

    def _extract_task_features(self, task: Task) -> List[float]:
        features = [
            len(task.description),
            task.due_date.timestamp() if task.due_date else 0,
            task.start_date.timestamp() if task.start_date else 0,
            task.category.id if task.category else 0,
            len(task.tags.all()),
            task.progress,
            1 if task.recurring else 0,
            len(task.subtasks.all()),
            len(task.comments.all()),
            len(task.attachments.all()),
            self._encode_priority(task.priority),
        ]
        return features
    
    def _encode_priority(self, priority: str) -> str:
        priority_map = {'low': 'low', 'medium': 'medium', 'high': 'high', 'urgent': 'urgent'}
        return priority_map.get(priority.lower(), 'medium')


    def _calculate_confidence(self, model, features):
        # For RandomForestRegressor, we can use the standard deviation of predictions across trees
        predictions = [tree.predict([features])[0] for tree in model.estimators_]
        return 1 / (1 + np.std(predictions))

    def optimize_user_schedule(self, user) -> List[Dict[str, Any]]:
        tasks = Task.objects.filter(user=user, status='open').order_by('due_date')
        schedule = []

        for task in tasks:
            completion_time = self.predict_task_completion_time(task)
            priority = self.predict_task_priority(task)
            
            schedule.append({
                'task_id': task.id,
                'description': task.description,
                'estimated_completion_time': completion_time,
                'priority': priority,
                'due_date': task.due_date
            })

        optimized_schedule = self._optimize_schedule(schedule)

        AIRecommendation.objects.create(
            user=user,
            model=self.openai_model,
            recommendation_type='schedule_optimization',
            recommendation={'optimized_schedule': optimized_schedule},
            confidence=0.8  # Assuming a fixed confidence for now
        )

        return optimized_schedule

    def _optimize_schedule(self, schedule: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Sort tasks by priority and due date
        sorted_schedule = sorted(schedule, key=lambda x: (x['priority'], x['due_date']))

        # Calculate available time per day (assuming 8 working hours)
        available_time = 8 * 60  # 8 hours in minutes

        optimized_schedule = []
        current_day = datetime.now().date()
        daily_schedule = []
        daily_time = 0

        for task in sorted_schedule:
            task_duration = task['estimated_completion_time'] * 60  # Convert hours to minutes

            if daily_time + task_duration > available_time:
                optimized_schedule.append({
                    'date': current_day,
                    'tasks': daily_schedule
                })
                current_day += timedelta(days=1)
                daily_schedule = []
                daily_time = 0

            daily_schedule.append(task)
            daily_time += task_duration

        if daily_schedule:
            optimized_schedule.append({
                'date': current_day,
                'tasks': daily_schedule
            })

        return optimized_schedule

    def apply_recommendation(self, recommendation: AIRecommendation) -> bool:
        if recommendation.recommendation_type == 'task_suggestion':
            return self._apply_task_suggestion(recommendation)
        elif recommendation.recommendation_type == 'schedule_optimization':
            return self._apply_schedule_optimization(recommendation)
        else:
            logger.error(f"Unknown recommendation type: {recommendation.recommendation_type}")
            return False

    def _apply_task_suggestion(self, recommendation: AIRecommendation) -> bool:
        try:
            suggestion = recommendation.recommendation
            task = Task.objects.create(
                user=recommendation.user,
                title=suggestion['description'],
                description=suggestion['description'],
                priority=suggestion['priority'].lower(),
                estimated_duration=timedelta(hours=suggestion['estimated_duration'])
            )

            project, _ = Project.objects.get_or_create(name=suggestion['project'], user=recommendation.user)
            task.project = project

            for tag_name in suggestion['tags']:
                tag, _ = Tag.objects.get_or_create(name=tag_name, user=recommendation.user)
                task.tags.add(tag)

            task.save()
            return True
        except Exception as e:
            logger.error(f"Error applying task suggestion: {str(e)}")
            return False

    def _apply_schedule_optimization(self, recommendation: AIRecommendation) -> bool:
        try:
            optimized_schedule = recommendation.recommendation['optimized_schedule']
            for day_schedule in optimized_schedule:
                date = day_schedule['date']
                for task_data in day_schedule['tasks']:
                    task = Task.objects.get(id=task_data['task_id'])
                    task.start_date = datetime.combine(date, datetime.min.time())
                    task.due_date = task.start_date + timedelta(hours=task_data['estimated_completion_time'])
                    task.save()
            return True
        except Exception as e:
            logger.error(f"Error applying schedule optimization: {str(e)}")
            return False

class NLPTaskCreator:
    def __init__(self):
        self.nlp_model = self.load_nlp_model()
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.zero_shot_classifier = pipeline("zero-shot-classification")

    def create_task_from_text(self, user, text):
        try:
            parsed_data = self.nlp_model(text)
            task_data = self.extract_task_data(parsed_data)
            sentiment = self.analyze_sentiment(text)
            task_data['sentiment'] = sentiment

            task = Task.objects.create(user=user, **task_data)
            
            # Predict task priority
            priority = self.predict_priority(text)
            task.priority = priority
            
            # Suggest tags
            suggested_tags = self.suggest_tags(text)
            for tag_name in suggested_tags:
                tag, _ = Tag.objects.get_or_create(name=tag_name, user=user)
                task.tags.add(tag)
            
            task.save()

            logger.info(f"Created task from text for user {user.id}: {task.title}")
            return task
        except Exception as e:
            logger.error(f"Error creating task from text for user {user.id}: {str(e)}")
            raise

    def load_nlp_model(self):
        try:
            return spacy.load("en_core_web_sm")
        except Exception as e:
            logger.error(f"Error loading NLP model: {str(e)}")
            raise

    def extract_task_data(self, parsed_data):
        task_data = {
            'title': '',
            'description': '',
            'due_date': None,
            'priority': 'medium',
        }

        for ent in parsed_data.ents:
            if ent.label_ == 'TASK':
                task_data['title'] = ent.text
            elif ent.label_ == 'DATE':
                task_data['due_date'] = self.parse_date(ent.text)
            elif ent.label_ == 'PRIORITY':
                task_data['priority'] = self.map_priority(ent.text)

        task_data['description'] = parsed_data.text
        return task_data


    def parse_date(self, date_text):
        try:
            parsed_date = parser.parse(date_text, fuzzy=True)
            if parsed_date.tzinfo is None:
                parsed_date = parsed_date.replace(tzinfo=timezone.utc)
        
            return parsed_date
        except ValueError:
            logger.error(f"Failed to parse date: {date_text}")
            return None


    def map_priority(self, priority_text):
        priority_map = {
            'high': 'high',
            'medium': 'medium',
            'low': 'low',
            'urgent': 'high',
            'important': 'high',
        }
        return priority_map.get(priority_text.lower(), 'medium')

    def analyze_sentiment(self, text):
        result = self.sentiment_analyzer(text)[0]
        return result['label']

    def predict_priority(self, text):
        labels = ["high priority", "medium priority", "low priority"]
        result = self.zero_shot_classifier(text, labels)
        return result['labels'][0].split()[0]

    def suggest_tags(self, text):
        common_tags = ["work", "personal", "urgent", "long-term", "quick", "complex"]
        result = self.zero_shot_classifier(text, common_tags, multi_label=True)
        return [label for label, score in zip(result['labels'], result['scores']) if score > 0.5]

class WorkflowAutomationAI:
    def __init__(self):
        self.model = self.train_automation_model()

    def suggest_automations(self, user):
        try:
            user_data = self.collect_user_data(user)
            suggestions = self.model.predict_proba(user_data)
            formatted_suggestions = self.format_suggestions(suggestions)

            AIRecommendation.objects.create(
                user=user,
                model=AIModel.objects.get(name='Workflow Automation AI'),
                recommendation_type='workflow_automation',
                recommendation=formatted_suggestions,
                confidence=np.max(suggestions)
            )

            logger.info(f"Generated workflow automation suggestions for user {user.id}")
            return formatted_suggestions
        except Exception as e:
            logger.error(f"Error suggesting automations for user {user.id}: {str(e)}")
            raise

    def train_automation_model(self):
        try:
            # Collect historical workflow data
            workflows = Workflow.objects.all()
            X = [self.extract_workflow_features(workflow) for workflow in workflows]
            y = [workflow.automation_type for workflow in workflows]

            # Prepare the data
            vectorizer = TfidfVectorizer(max_features=1000)
            X_text = vectorizer.fit_transform(X)

              # Add categorical features
            categorical_features = np.array([[workflow.trigger_type, workflow.action_type] for workflow in workflows])
        
                  # Combine text and categorical features
            X_combined = hstack([X_text, categorical_features])

             # Split the data
            X_train, X_test, y_train, y_test = train_test_split(X_combined, y, test_size=0.2, random_state=42)

             # Create a preprocessor for categorical variables
            categorical_features = [X_text.shape[1], X_text.shape[1] + 1]  # Indices of categorical features
        
            preprocessor = ColumnTransformer(
                transformers=[
                    ('cat', OneHotEncoder(drop='first', sparse=False), categorical_features)
                ],
                remainder='passthrough'
            )

             # Train the model
            model = Pipeline([
                ('preprocessor', preprocessor),
                ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
            ])
        
            # Train the model
            model.fit(X_train, y_train)

            # Evaluate the model
            accuracy = model.score(X_test, y_test)
            logger.info(f"Workflow Automation Model - Accuracy: {accuracy}")

            return model
        except Exception as e:
            logger.error(f"Error training workflow automation model: {str(e)}")
            raise

    def collect_user_data(self, user):
        try:
            recent_tasks = Task.objects.filter(user=user).order_by('-created_at')[:50]
            task_data = [self.extract_task_features(task) for task in recent_tasks]
            return self.prepare_user_data(task_data)
        except Exception as e:
            logger.error(f"Error collecting user data for user {user.id}: {str(e)}")
            raise

    def extract_workflow_features(self, workflow):
        # Extract relevant features from a workflow
        features = f"{workflow.name} {workflow.description} {workflow.trigger_condition} {workflow.action_type}"
        return features
    

    def extract_task_features(self, task):
        # Extract relevant features from a task
        features = f"{task.title} {task.description} {task.priority} {task.status}"
        return features

    def prepare_user_data(self, task_data):
        # Prepare user data for model input
        vectorizer = TfidfVectorizer(max_features=1000)
        return vectorizer.fit_transform(task_data)

    def format_suggestions(self, suggestions):
        automation_types = ['task_dependency', 'recurring_task', 'project_template']
        formatted_suggestions = []
        for i, prob in enumerate(suggestions[0]):
            if prob > 0.3:
                formatted_suggestions.append({
                    'type': automation_types[i],
                    'confidence': float(prob),
                    'description': self.get_automation_description(automation_types[i])
                })
        return formatted_suggestions

    def get_automation_description(self, automation_type):
        descriptions = {
            'task_dependency': "Create a dependency between related tasks",
            'recurring_task': "Set up a recurring schedule for similar tasks",
            'project_template': "Create a project template based on your workflow"
        }
        return descriptions.get(automation_type, "")

class EnhancedAIService:
    def __init__(self):
        self.nlp_task_creator = NLPTaskCreator()
        self.workflow_automation = WorkflowAutomationAI()
        self.resource_allocation_ai = ResourceAllocationAI()
        self.task_dependency_analyzer = TaskDependencyAnalyzer()
        self.risk_assessment_ai = RiskAssessmentAI()
        self.collaboration_ai = CollaborationAI()

    def create_task_with_nlp(self, user, text):
        return self.nlp_task_creator.create_task_from_text(user, text)

    def get_workflow_suggestions(self, user):
        return self.workflow_automation.suggest_automations(user)

    def generate_task_suggestions(self, user: User) -> List[Dict[str, Any]]:
        try:
            completed_tasks = Task.objects.filter(user=user, status='completed').order_by('-completed_at')[:20]
            task_descriptions = [task.description for task in completed_tasks]
            projects = Project.objects.filter(user=user)
            project_names = [project.name for project in projects]
            
            prompt = f"""
            Based on the following completed tasks: {', '.join(task_descriptions)},
            and considering the user's projects: {', '.join(project_names)},
            suggest 5 new tasks for the user. For each task, provide:
            1. A task description
            2. A suggested project (from the list or a new one)
            3. Estimated priority (High, Medium, Low)
            4. A list of relevant tags
            5. Estimated duration in hours
            """
            
            suggestions = self.nlp_task_creator.generate_task_suggestions(prompt)
            logger.info(f"Generated {len(suggestions)} task suggestions for user {user.id}")
            return suggestions
        except Exception as e:
            logger.error(f"Error generating task suggestions for user {user.id}: {str(e)}")
            raise

    def analyze_project_complexity(self, project):
        try:
            tasks = Task.objects.filter(project=project)
            features = [
                tasks.count(),
                tasks.filter(priority='high').count(),
                project.due_date - project.start_date if project.due_date and project.start_date else timezone.timedelta(0),
                len(set(task.assigned_to for task in tasks if task.assigned_to))
            ]
            complexity_score = sum(features) / len(features) 
            
            AIPrediction.objects.create(
                user=project.user,
                model=AIModel.objects.get(name='Project Complexity Analyzer'),
                prediction_type='project_complexity',
                prediction={'complexity_score': complexity_score},
                confidence=0.8
            )

            logger.info(f"Analyzed complexity for project {project.id}")
            return complexity_score
        except Exception as e:
            logger.error(f"Error analyzing project complexity for project {project.id}: {str(e)}")
            raise

    def suggest_task_breakdown(self, task):
        try:
            subtasks = self.nlp_task_creator.zero_shot_classifier(
                task.description,
                ["research", "planning", "implementation", "testing", "documentation"],
                multi_label=True
            )
            
            suggested_breakdown = [
                {'name': label, 'confidence': score}
                for label, score in zip(subtasks['labels'], subtasks['scores'])
                if score > 0.3
            ]
            
            AIRecommendation.objects.create(
                user=task.user,
                model=AIModel.objects.get(name='Task Breakdown Suggester'),
                recommendation_type='task_breakdown',
                recommendation={'suggested_subtasks': suggested_breakdown},
                confidence=max(subtasks['scores'])
            )

            logger.info(f"Suggested task breakdown for task {task.id}")
            return suggested_breakdown
        except Exception as e:
            logger.error(f"Error suggesting task breakdown for task {task.id}: {str(e)}")
            raise

    def optimize_project_resources(self, project):
        return self.resource_allocation_ai.optimize_allocation(project)

    def analyze_task_dependencies(self, project):
        return self.task_dependency_analyzer.analyze_dependencies(project)

    def assess_project_risks(self, project):
        return self.risk_assessment_ai.assess_project_risks(project)

    def suggest_collaborations(self, project):
        return self.collaboration_ai.suggest_collaborations(project)

    def comprehensive_project_analysis(self, project):
        try:
            resource_allocation = self.optimize_project_resources(project)
            task_dependencies = self.analyze_task_dependencies(project)
            risk_assessment = self.assess_project_risks(project)
            collaboration_suggestions = self.suggest_collaborations(project)

            return {
                'resource_allocation': resource_allocation,
                'task_dependencies': task_dependencies,
                'risk_assessment': risk_assessment,
                'collaboration_suggestions': collaboration_suggestions,
            }
        except Exception as e:
            logger.error(f"Error performing comprehensive project analysis for project {project.id}: {str(e)}")
            raise

    def calculate_project_health_score(self, project):
        try:
            risk_assessment = self.risk_assessment_ai.assess_project_risks(project)
            collaboration_suggestions = self.collaboration_ai.suggest_collaborations(project)
            
            risk_score = 1 - risk_assessment['risk_breakdown']['high']
            collaboration_score = collaboration_suggestions['overall_collaboration_score']
            
            progress_score = project.tasks.filter(status='completed').count() / project.tasks.count()
            health_score = (risk_score + collaboration_score + progress_score) / 3
            
            return health_score
        except Exception as e:
            logger.error(f"Error calculating project health score for project {project.id}: {str(e)}")
            raise

    def generate_ai_insights_report(self, project):
        try:
            analysis = self.comprehensive_project_analysis(project)
            health_score = self.calculate_project_health_score(project)
            
            report = {
                'project_id': project.id,
                'project_name': project.name,
                'health_score': health_score,
                'resource_allocation_summary': self.summarize_resource_allocation(analysis['resource_allocation']),
                'critical_path': self.identify_critical_path(analysis['task_dependencies']),
                'top_risks': self.extract_top_risks(analysis['risk_assessment']),
                'collaboration_recommendations': self.summarize_collaboration_suggestions(analysis['collaboration_suggestions']),
                'ai_generated_action_items': self.generate_action_items(analysis, health_score),
            }
            
            return report
        except Exception as e:
            logger.error(f"Error generating AI insights report for project {project.id}: {str(e)}")
            raise

    def summarize_resource_allocation(self, allocation):
        summary = {
            'total_resources': len(allocation),
            'allocation_by_skill': {},
            'overallocated_resources': [],
            'underallocated_resources': []
        }
        
        for resource, assignments in allocation.items():
            total_hours = sum(task['estimated_hours'] for task in assignments)
            primary_skill = max(resource.skills.all(), key=lambda s: s.proficiency_level)
            
            if primary_skill.name not in summary['allocation_by_skill']:
                summary['allocation_by_skill'][primary_skill.name] = 0
            summary['allocation_by_skill'][primary_skill.name] += total_hours
            
            if total_hours > 40:
                summary['overallocated_resources'].append({
                    'resource_id': resource.id,
                    'name': resource.name,
                    'allocated_hours': total_hours
                })
            elif total_hours < 20:
                summary['underallocated_resources'].append({
                    'resource_id': resource.id,
                    'name': resource.name,
                    'allocated_hours': total_hours
                })
        
        return summary

    def identify_critical_path(self, task_dependencies):
        G = nx.DiGraph()
        for task in task_dependencies:
            G.add_node(task['id'], duration=task['estimated_duration'])
            for dep in task['dependencies']:
                G.add_edge(dep, task['id'])
        
        critical_path = nx.dag_longest_path(G)
        critical_path_duration = sum(G.nodes[task]['duration'] for task in critical_path)
        
        return {
            'critical_path': critical_path,
            'critical_path_duration': critical_path_duration,
            'critical_tasks': [
                {
                    'task_id': task,
                    'duration': G.nodes[task]['duration']
                } for task in critical_path
            ]
        }

    def extract_top_risks(self, risk_assessment):
        risks = risk_assessment['risk_factors']
        probabilities = risk_assessment['risk_breakdown']
        
        top_risks = sorted(
            [{'risk': risk, 'probability': probabilities.get(risk, 0)} for risk in risks],
            key=lambda x: x['probability'],
            reverse=True
        )[:5]
        
        return {
            'top_risks': top_risks,
            'overall_risk_level': risk_assessment['overall_risk_level'],
            'mitigation_strategies': risk_assessment['mitigation_strategies'][:5]
        }

    def summarize_collaboration_suggestions(self, suggestions):
        summary = {
            'overall_collaboration_score': suggestions['overall_collaboration_score'],
            'recommended_meeting_frequency': suggestions['recommended_meeting_frequency'],
            'recommended_team_structure': suggestions['recommended_team_structure'],
            'key_suggestions': suggestions['specific_suggestions'][:3]
        }
        
        if suggestions['overall_collaboration_score'] < 0.6:
            summary['collaboration_status'] = "Needs Improvement"
        elif suggestions['overall_collaboration_score'] < 0.8:
            summary['collaboration_status'] = "Satisfactory"
        else:
            summary['collaboration_status'] = "Excellent"
        
        return summary

    def generate_action_items(self, analysis, health_score):
        action_items = []
        
        if analysis['resource_allocation']['overallocated_resources']:
            action_items.append("Redistribute workload from overallocated resources")
        if analysis['resource_allocation']['underallocated_resources']:
            action_items.append("Assign more tasks to underallocated resources")
        
        critical_path = analysis['task_dependencies']['critical_path']
        if len(critical_path) > len(analysis['task_dependencies']) / 2:
            action_items.append("Review and optimize the critical path to reduce project duration")

        top_risks = self.extract_top_risks(analysis['risk_assessment'])
        for risk in top_risks['top_risks']:
            action_items.append(f"Develop mitigation plan for risk: {risk['risk']}")

        collab_summary = self.summarize_collaboration_suggestions(analysis['collaboration_suggestions'])
        if collab_summary['overall_collaboration_score'] < 0.6:
            action_items.append("Improve team collaboration through team-building activities")

        if health_score < 0.5:
            action_items.append("Conduct a comprehensive project review to address major issues")
        elif health_score < 0.7:
            action_items.append("Identify and address key areas for improvement to boost project health")

        return action_items

    def optimize_user_schedule(self, user: User) -> List[Dict[str, Any]]:
        try:
            tasks = Task.objects.filter(user=user, status='open').order_by('due_date')
            schedule = []

            for task in tasks:
                completion_time = self.predict_task_completion_time(task)
                priority = self.predict_task_priority(task)
                
                schedule.append({
                    'task_id': task.id,
                    'description': task.description,
                    'estimated_completion_time': completion_time,
                    'priority': priority,
                    'due_date': task.due_date
                })

            optimized_schedule = self._optimize_schedule(schedule)
            logger.info(f"Optimized schedule for user {user.id} with {len(optimized_schedule)} entries")
            return optimized_schedule
        except Exception as e:
            logger.error(f"Error optimizing schedule for user {user.id}: {str(e)}")
            raise

    def _optimize_schedule(self, schedule: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        sorted_schedule = sorted(schedule, key=lambda x: (x['priority'], x['due_date']))
        available_time = 8 * 60  # 8 hours in minutes

        optimized_schedule = []
        current_day = datetime.now().date()
        daily_schedule = []
        daily_time = 0

        for task in sorted_schedule:
            task_duration = task['estimated_completion_time'] * 60  # Convert hours to minutes

            if daily_time + task_duration > available_time:
                optimized_schedule.append({
                    'date': current_day,
                    'tasks': daily_schedule
                })
                current_day += timedelta(days=1)
                daily_schedule = []
                daily_time = 0

            daily_schedule.append(task)
            daily_time += task_duration

        if daily_schedule:
            optimized_schedule.append({
                'date': current_day,
                'tasks': daily_schedule
            })

        return optimized_schedule

    def predict_task_completion_time(self, task):
        features = self._extract_task_features(task)
        prediction = self.task_completion_model.predict([features])[0]
        confidence = self._calculate_confidence(self.task_completion_model, features)

        AIPrediction.objects.create(
            user=task.user,
            task=task,
            model=self.openai_model,
            prediction_type='completion_time',
            prediction={'completion_time': prediction},
            confidence=confidence
        )

        return prediction

    def predict_task_priority(self, task):
        features = self._extract_task_features(task)
        prediction = self.task_priority_model.predict([features])[0]
        confidence = self.task_priority_model.predict_proba([features]).max()

        AIPrediction.objects.create(
            user=task.user,
            task=task,
            model=self.openai_model,
            prediction_type='priority',
            prediction={'priority': prediction},
            confidence=confidence
        )

        return prediction

    def balance_team_workload(self, project):
        try:
            team_members = project.team.all()
            tasks = Task.objects.filter(project=project, status='open')
            
            member_workloads = {member: 0 for member in team_members}
            for task in tasks:
                if task.assigned_to:
                    member_workloads[task.assigned_to] += task.estimated_hours or 1
            
            avg_workload = sum(member_workloads.values()) / len(team_members)
            suggestions = []
            
            for task in tasks.filter(assigned_to__isnull=True):
                best_member = min(member_workloads, key=member_workloads.get)
                suggestions.append({
                    'task_id': task.id,
                    'suggested_assignee': best_member.id,
                    'current_workload': member_workloads[best_member],
                    'avg_workload': avg_workload
                })
                member_workloads[best_member] += task.estimated_hours or 1
            
            AIRecommendation.objects.create(
                user=project.user,
                model=AIModel.objects.get(name='Workload Balancer'),
                recommendation_type='workload_balance',
                recommendation={'task_assignments': suggestions},
                confidence=0.9
            )

            logger.info(f"Generated workload balance suggestions for project {project.id}")
            return suggestions
        except Exception as e:
            logger.error(f"Error balancing team workload for project {project.id}: {str(e)}")
            raise

    def _extract_task_features(self, task):
        features = [
            len(task.description),
            task.due_date.timestamp() if task.due_date else 0,
            task.start_date.timestamp() if task.start_date else 0,
            task.category.id if task.category else 0,
            len(task.tags.all()),
            task.progress,
            1 if task.recurring else 0,
            len(task.subtasks.all()),
            len(task.comments.all()),
            len(task.attachments.all()),
            self._encode_priority(task.priority),
        ]
        return features
    
    def _encode_priority(self, priority):
        priority_map = {'low': 0, 'medium': 1, 'high': 2, 'urgent': 3}
        return priority_map.get(priority.lower(), 1)

    def _calculate_confidence(self, model, features):
        predictions = [tree.predict([features])[0] for tree in model.estimators_]
        return 1 / (1 + np.std(predictions))

    def apply_recommendation(self, recommendation):
        if recommendation.recommendation_type == 'task_suggestion':
            return self._apply_task_suggestion(recommendation)
        elif recommendation.recommendation_type == 'schedule_optimization':
            return self._apply_schedule_optimization(recommendation)
        else:
            logger.error(f"Unknown recommendation type: {recommendation.recommendation_type}")
            return False

    def _apply_task_suggestion(self, recommendation):
        try:
            suggestion = recommendation.recommendation
            task = Task.objects.create(
                user=recommendation.user,
                title=suggestion['description'],
                description=suggestion['description'],
                priority=suggestion['priority'].lower(),
                estimated_duration=timedelta(hours=suggestion['estimated_duration'])
            )

            project, _ = Project.objects.get_or_create(name=suggestion['project'], user=recommendation.user)
            task.project = project

            for tag_name in suggestion['tags']:
                tag, _ = Tag.objects.get_or_create(name=tag_name, user=recommendation.user)
                task.tags.add(tag)

            task.save()
            return True
        except Exception as e:
            logger.error(f"Error applying task suggestion: {str(e)}")
            return False

    def _apply_schedule_optimization(self, recommendation):
        try:
            optimized_schedule = recommendation.recommendation['optimized_schedule']
            for day_schedule in optimized_schedule:
                date = day_schedule['date']
                for task_data in day_schedule['tasks']:
                    task = Task.objects.get(id=task_data['task_id'])
                    task.start_date = datetime.combine(date, datetime.min.time())
                    task.due_date = task.start_date + timedelta(hours=task_data['estimated_completion_time'])
                    task.save()
            return True
        except Exception as e:
            logger.error(f"Error applying schedule optimization: {str(e)}")
            return False



    # AI-driven team workload balancing
    def balance_team_workload(self, project):
        try:
            team_members = project.team.all()
            tasks = Task.objects.filter(project=project, status='open')
            
            member_workloads = {member: 0 for member in team_members}
            for task in tasks:
                if task.assigned_to:
                    member_workloads[task.assigned_to] += task.estimated_hours or 1
            
            avg_workload = sum(member_workloads.values()) / len(team_members)
            suggestions = []
            
            for task in tasks.filter(assigned_to__isnull=True):
                best_member = min(member_workloads, key=member_workloads.get)
                suggestions.append({
                    'task_id': task.id,
                    'suggested_assignee': best_member.id,
                    'current_workload': member_workloads[best_member],
                    'avg_workload': avg_workload
                })
                member_workloads[best_member] += task.estimated_hours or 1
            
            AIRecommendation.objects.create(
                user=project.user,
                model=AIModel.objects.get(name='Workload Balancer'),
                recommendation_type='workload_balance',
                recommendation={'task_assignments': suggestions},
                confidence=0.9
            )

            logger.info(f"Generated workload balance suggestions for project {project.id}")
            return suggestions
        except Exception as e:
            logger.error(f"Error balancing team workload for project {project.id}: {str(e)}")
            raise

class ResourceAllocationAI:
    def __init__(self):
        self.allocation_model = self.train_allocation_model()

    def optimize_allocation(self, project):
        try:
            project_data = self.collect_project_data(project)
            team_data = self.collect_team_data(project.team.all())
            optimal_allocation = self.allocation_model.predict(
                pd.concat([project_data, team_data], axis=1)
            )
            return self.apply_allocation(project, optimal_allocation)
        except Exception as e:
            logger.error(f"Error in resource allocation for project {project.id}: {str(e)}")
            raise

    def train_allocation_model(self):
        try:
            historical_data = self.collect_historical_allocation_data()
            if 'efficiency_score' not in historical_data.columns:
                print("Warning: 'efficiency_score' not found in historical data")
                return None
        
             # Identify categorical and numerical columns
            categorical_columns = ['project_priority']
            numerical_columns = [col for col in historical_data.columns if col not in categorical_columns + ['efficiency_score']]
        
             # One-hot encode categorical variables
            X = pd.get_dummies(historical_data[categorical_columns + numerical_columns], columns=categorical_columns)
        
             # Ensure all columns are numeric
            for col in X.columns:
                X[col] = pd.to_numeric(X[col], errors='coerce')
        
             # Drop rows with NaN values
            X = X.dropna()
        
            y = historical_data.loc[X.index, 'efficiency_score']
        
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
        
            accuracy = model.score(X_test, y_test)
            logger.info(f"Resource Allocation Model - Accuracy: {accuracy}")
        
            return model
        except Exception as e:
            logger.error(f"Error training resource allocation model: {str(e)}")
            raise

    def collect_project_data(self, project):
        return pd.DataFrame({
            'project_id': [project.id],
            'project_priority': [project.priority],
            'project_complexity': [project.complexity],
            'project_duration': [(project.end_date - project.start_date).days],
            'num_tasks': [project.tasks.count()],
        })

    def collect_team_data(self, team):
        team_data = []
        for member in team:
            member_data = {
                'member_id': member.id,
                'skills': [skill.name for skill in member.skills.all()],
                'experience': member.years_of_experience,
                'current_workload': self.calculate_current_workload(member),
                'performance_score': self.calculate_performance_score(member),
            }
            team_data.append(member_data)
        return pd.DataFrame(team_data)

    def calculate_current_workload(self, team_member):
        current_tasks = Task.objects.filter(assigned_to=team_member, status='in_progress')
        return sum(task.estimated_hours for task in current_tasks)

    def calculate_performance_score(self, team_member):
        completed_tasks = Task.objects.filter(assigned_to=team_member, status='completed')
        if not completed_tasks:
            return 0
        on_time_tasks = completed_tasks.filter(completed_at__lte=F('due_date'))
        return on_time_tasks.count() / completed_tasks.count()

    def collect_historical_allocation_data(self):
        
        historical_projects = Project.objects.filter(status='completed')
        
        data = []
        for project in historical_projects:
            project_data = {
                'project_priority': project.priority,
                'project_complexity': float(project.complexity or 0),
                'project_duration': (project.end_date - project.start_date).days,
                'num_tasks': project.tasks.count(),
                'team_size': project.team.count(),
                'avg_team_experience': project.team.aggregate(Avg('userprofile__years_of_experience'))['userprofile__years_of_experience__avg'] or 0,
                'avg_team_workload': project.team.aggregate(Avg('userprofile__workload'))['userprofile__workload__avg'] or 0,
                'efficiency_score': float(project.efficiency_score or 0)
            }
            data.append(project_data)
                
        return pd.DataFrame(data)


    def apply_allocation(self, project, optimal_allocation):
        try:
            tasks = project.tasks.filter(status='not_started')
            team = project.team.all()
            
            # Create a cost matrix based on the optimal allocation
            cost_matrix = np.zeros((len(tasks), len(team)))
            for i, task in enumerate(tasks):
                for j, member in enumerate(team):
                    cost_matrix[i, j] = -optimal_allocation[i * len(team) + j]
            
            row_ind, col_ind = linear_sum_assignment(cost_matrix)
            
            for i, j in zip(row_ind, col_ind):
                task = tasks[i]
                member = team[j]
                task.assigned_to = member
                task.save()
            
            return "Resource allocation applied successfully"
        except Exception as e:
            logger.error(f"Error applying resource allocation for project {project.id}: {str(e)}")
            raise

class TaskDependencyAnalyzer:
    def __init__(self):
        self.dependency_model = self.train_dependency_model()

    def analyze_dependencies(self, project):
        try:
            task_data = self.collect_task_data(project)
            optimal_order = self.dependency_model.predict(task_data)
            return self.generate_recommendations(project, optimal_order)
        except Exception as e:
            logger.error(f"Error analyzing task dependencies for project {project.id}: {str(e)}")
            raise

    def train_dependency_model(self):
        try:
            historical_tasks = Task.objects.filter(project__status='completed')
            task_features = []
            task_orders = []
            
            for project in Project.objects.filter(status='completed'):
                project_tasks = historical_tasks.filter(project=project).order_by('completed_at')
                task_order = list(project_tasks.values_list('id', flat=True))
            
                for task in project_tasks:
                    features = [
                        task.ai_estimated_duration,
                        self.encode_priority(task.priority),
                        task.complexity,
                        task.dependencies.count(),
                        task.project.team.count()
                    ]
                    task_features.append(features)
                    task_orders.append(task_order.index(task.id))

            # Create a pipeline with SimpleImputer, StandardScaler, and KMeans
            model = Pipeline([
                ('imputer', SimpleImputer(strategy='mean')),
                ('scaler', StandardScaler()),
                ('kmeans', KMeans(n_clusters=10))
            ])

            X = np.array(task_features)
            model.fit(X)

            class DependencyModel:
                def __init__(self, pipeline_model):
                    self.pipeline_model = pipeline_model

                def predict(self, task_data):
                    G = DiGraph()
                    task_features = []

                    for task in task_data:
                        G.add_node(task['id'])
                        for dep in task['dependencies']:
                            G.add_edge(dep, task['id'])

                        features = [
                            task['estimated_duration'],
                            self.encode_priority(task['priority']),
                            task['complexity'],
                            len(task['dependencies']),
                            task['team_size']
                        ]
                        task_features.append(features)
    
                    X = np.array(task_features)
                    clusters = self.pipeline_model.predict(X)
                
                    sorted_tasks = sorted(zip(task_data, clusters), key=lambda x: x[1])
                    ordered_tasks = [task['id'] for task, _ in sorted_tasks]
                
                    return list(topological_sort(G))
            
                def encode_priority(self, priority):
                    priority_map = {'low': 0, 'medium': 1, 'high': 2, 'urgent': 3}
                    return priority_map.get(priority.lower(), 1)
            
            return DependencyModel(model)
        except Exception as e:
            logger.error(f"Error training task dependency model: {str(e)}")
            raise
    def encode_priority(self, priority):
        priority_map = {'low': 0, 'medium': 1, 'high': 2, 'urgent': 3}
        return priority_map.get(priority.lower(), 1)

    

    def collect_task_data(self, project):
        return [
            {
                'id': task.id,
                'title': task.title,
                'estimated_duration': task.estimated_duration,
                'dependencies': [dep.id for dep in task.dependencies.all()],
            }
            for task in project.tasks.all()
        ]

    def generate_recommendations(self, project, optimal_order):
        try:
            recommendations = []
            current_time = 0
            for task_id in optimal_order:
                task = project.tasks.get(id=task_id)
                parallel_tasks = self.find_parallel_tasks(project, task, optimal_order)
                recommendations.append({
                    'task_id': task_id,
                    'start_time': current_time,
                    'parallel_tasks': parallel_tasks,
                })
                current_time += task.estimated_duration
            
            return recommendations
        except Exception as e:
            logger.error(f"Error generating task dependency recommendations for project {project.id}: {str(e)}")
            raise

    def find_parallel_tasks(self, project, task, optimal_order):
        task_index = optimal_order.index(task.id)
        parallel_tasks = []
        for other_task in project.tasks.all():
            if other_task.id in optimal_order[task_index+1:] and not set(other_task.dependencies.all()).intersection(set(task.dependencies.all())):
                parallel_tasks.append(other_task.id)
        return parallel_tasks

class RiskAssessmentAI:
    def __init__(self):
        self.risk_model = self.train_risk_model()

    def assess_project_risks(self, project):
        try:
            project_data = self.collect_project_data(project)
            external_data = self.collect_external_data()
            risk_assessment = self.risk_model.predict_proba(
                pd.concat([project_data, external_data], axis=1)
            )
            return self.format_risk_report(project, risk_assessment)
        except Exception as e:
            logger.error(f"Error assessing risks for project {project.id}: {str(e)}")
            raise

    def train_risk_model(self):
        try:
            historical_data = self.collect_historical_risk_data()
            
            X = historical_data.drop('risk_level', axis=1)
            y = historical_data['risk_level']
            
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            accuracy = model.score(X_test, y_test)
            logger.info(f"Risk Assessment Model - Accuracy: {accuracy}")
            
            return model
        except Exception as e:
            logger.error(f"Error training risk assessment model: {str(e)}")
            raise

    def collect_project_data(self, project):
        return pd.DataFrame({
            'project_id': [project.id],
            'project_budget': [project.budget],
            'project_duration': [(project.end_date - project.start_date).days],
            'team_size': [project.team.count()],
            'num_tasks': [project.tasks.count()],
            'num_completed_tasks': [project.tasks.filter(status='completed').count()],
            'num_high_priority_tasks': [project.tasks.filter(priority='high').count()],
        })

    def collect_external_data(self):
        try:
             # Fetch economic indicators from an API
            economic_response = requests.get('https://api.example.com/economic-indicators')
            economic_data = economic_response.json()
        
             # Fetch weather data from an API
            weather_response = requests.get('https://api.example.com/weather-forecast')
            weather_data = weather_response.json()
        
              # Fetch industry trends from an API
            industry_response = requests.get('https://api.example.com/industry-trends')
            industry_data = industry_response.json()
        
            return pd.DataFrame({
                'market_volatility': [economic_data['market_volatility']],
                'economic_growth': [economic_data['gdp_growth_rate']],
                'industry_disruption_level': [industry_data['disruption_level']],
                 'weather_severity': [weather_data['severity_index']],
            })
        except Exception as e:
            logger.error(f"Error collecting external data: {str(e)}")
            raise


    def collect_historical_risk_data(self):
        historical_projects = Project.objects.filter(status='completed')
        
        data = []
        for project in historical_projects:
            project_data = {
                'project_budget': project.budget,
                'project_duration': (project.end_date - project.start_date).days,
                'team_size': project.team.count(),
                'num_tasks': project.tasks.count(),
                'num_completed_tasks': project.tasks.filter(status='completed').count(),
                'num_high_priority_tasks': project.tasks.filter(priority='high').count(),
                'market_volatility': project.market_volatility,
                'economic_growth': project.economic_growth,
                'industry_disruption_level': project.industry_disruption_level,
                'risk_level': project.risk_level
            }
            
            data.append(project_data)
        
        return pd.DataFrame(data)


    def format_risk_report(self, project, risk_assessment):
        risk_levels = ['low', 'medium', 'high']
        risk_probabilities = risk_assessment[0]
        
        report = {
            'project_id': project.id,
            'project_name': project.name,
            'overall_risk_level': risk_levels[np.argmax(risk_probabilities)],
            'risk_breakdown': {
                level: float(prob) for level, prob in zip(risk_levels, risk_probabilities)
            },
            'risk_factors': self.identify_risk_factors(project),
            'mitigation_strategies': self.suggest_mitigation_strategies(project),
        }
        
        return report

    def identify_risk_factors(self, project):
        risk_factors = []
        
        if project.budget < 50000:
            risk_factors.append("Low budget")
        
        if (project.end_date - project.start_date).days > 365:
            risk_factors.append("Long project duration")
        
        if project.team.count() < 3:
            risk_factors.append("Small team size")
        
        if project.tasks.filter(status='delayed').count() > 0:
            risk_factors.append("Delayed tasks")
                
        if project.tasks.filter(priority='high', status='not_started').count() > 3:
            risk_factors.append("Multiple high-priority tasks not started")
        
        return risk_factors

    def suggest_mitigation_strategies(self, project):
        strategies = []
        risk_factors = self.identify_risk_factors(project)
        
        if "Low budget" in risk_factors:
            strategies.append("Review and optimize resource allocation to maximize efficiency")
        
        if "Long project duration" in risk_factors:
            strategies.append("Break down the project into smaller, manageable phases")
        
        if "Small team size" in risk_factors:
            strategies.append("Consider bringing in additional team members or outsourcing certain tasks")
        
        if "Delayed tasks" in risk_factors:
            strategies.append("Conduct a thorough review of delayed tasks and implement a recovery plan")
        
        if "Multiple high-priority tasks not started" in risk_factors:
            strategies.append("Reassess task priorities and allocate resources to high-priority tasks immediately")
        
        return strategies


class CollaborationAI:
    def __init__(self):
        self.collaboration_model = self.train_collaboration_model()

    def suggest_collaborations(self, project):
        try:
            team_data = self.collect_team_data(project.team.all())
            project_data = self.collect_project_data(project)
            suggestions = self.collaboration_model.predict(
                pd.concat([team_data, project_data], axis=1)
            )
            return self.format_collaboration_suggestions(project, suggestions)
        except Exception as e:
            logger.error(f"Error suggesting collaborations for project {project.id}: {str(e)}")
            raise

    def train_collaboration_model(self):
        try:
            historical_data = self.collect_historical_collaboration_data()
        
            df = pd.DataFrame(historical_data)
        
            X = df.drop(['collaboration_score', 'meeting_frequency', 'team_structure'], axis=1)
            y = df[['collaboration_score', 'meeting_frequency', 'team_structure']]
        
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
        
            mse = mean_squared_error(y_test, model.predict(X_test))
            logger.info(f"Collaboration Model - Mean Squared Error: {mse}")
            
            return model
        except Exception as e:
            logger.error(f"Error training collaboration model: {str(e)}")
            return None


    def collect_team_data(self, team):
        team_data = []
        for member in team:
            member_data = {
                'member_id': member.id,
                'role': member.role,
                'department': member.department,
                'years_of_experience': member.years_of_experience,
                'communication_preference': member.communication_preference,
                'collaboration_score': self.calculate_collaboration_score(member),
            }
            team_data.append(member_data)
        return pd.DataFrame(team_data)

    def collect_project_data(self, project):
        return pd.DataFrame({
            'project_id': [project.id],
            'project_type': [project.type],
            'project_complexity': [project.complexity],
            'project_duration': [(project.end_date - project.start_date).days],
            'num_tasks': [project.tasks.count()],
            'num_team_members': [project.team.count()],
        })

   
    def calculate_collaboration_score(self, team_member):
        completed_tasks = Task.objects.filter(assigned_to=team_member, status='completed')
        on_time_completion_rate = completed_tasks.filter(completed_at__lte=F('due_date')).count() / completed_tasks.count()
    
        avg_task_complexity = completed_tasks.aggregate(Avg('complexity'))['complexity__avg']
    
        peer_reviews = PeerReview.objects.filter(reviewee=team_member)
        avg_peer_rating = peer_reviews.aggregate(Avg('rating'))['rating__avg']
    
        communication_frequency = Communication.objects.filter(
            Q(sender=team_member) | Q(recipient=team_member)
        ).count() / 30 
    
        factors = [
            on_time_completion_rate,
            avg_task_complexity / 10, 
            avg_peer_rating / 5,  
            min(communication_frequency / 5, 1) 
        ]
    
        collaboration_score = sum(factors) / len(factors)
        
        return collaboration_score


    from django.db.models import Avg

    def collect_historical_collaboration_data(self):
        historical_data = []
        projects = Project.objects.all()
        for project in projects:
            project_data = {
                'team_size': project.team.count(),
                'project_duration': (project.end_date - project.start_date).days if project.end_date else 0,
                'num_tasks': project.tasks.count(),
                'num_completed_tasks': project.tasks.filter(status='completed').count(),
                'avg_task_completion_time': project.tasks.filter(status='completed').aggregate(Avg('completion_time'))['completion_time__avg'] or 0,
                'num_comments': Communication.objects.filter(project=project).count(),
                'num_reviews': PeerReview.objects.filter(task__project=project).count(),
                'collaboration_score': project.collaboration_score,
                'avg_team_experience': project.team.aggregate(Avg('userprofile__years_of_experience'))['userprofile__years_of_experience__avg'] or 0,
                'team_structure': project.team_structure,
                'meeting_frequency': project.meeting_frequency,  
                'meeting_types': project.get_meeting_types(),
            }
            historical_data.append(project_data)
        return historical_data


    def format_collaboration_suggestions(self, project, suggestions):
        collaboration_score, meeting_frequency, team_structure = suggestions[0]
        
        recommendations = {
            'project_id': project.id,
            'project_name': project.name,
            'overall_collaboration_score': float(collaboration_score),
            'recommended_meeting_frequency': int(meeting_frequency),
            'recommended_team_structure': team_structure,
            'specific_suggestions': self.generate_specific_suggestions(project, collaboration_score),
        }
        
        return recommendations

    def generate_specific_suggestions(self, project, collaboration_score):
        suggestions = []
        
        if collaboration_score < 0.6:
            suggestions.append("Implement regular team-building activities to improve collaboration")
        
        if project.team.count() > 10:
            suggestions.append("Consider breaking the team into smaller, focused sub-teams")
        
        if project.type == 'software' and 'daily_standup' not in project.meeting_types:
            suggestions.append("Implement daily standup meetings for better communication")
        
        if project.complexity > 7:
            suggestions.append("Set up a project war room for intensive collaboration periods")
        
        return suggestions
