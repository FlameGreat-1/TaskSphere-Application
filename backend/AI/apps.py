from django.apps import AppConfig
import spacy



class AiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'AI'
    def ready(self):
        # Load the spaCy model
        self.nlp = spacy.load("en_core_web_sm")
    



