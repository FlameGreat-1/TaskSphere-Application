from django import forms
from django.conf import settings
from .models import Profile

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['bio', 'location', 'birth_date']

class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = settings.AUTH_USER_MODEL
        fields = ['first_name', 'last_name', 'email']
