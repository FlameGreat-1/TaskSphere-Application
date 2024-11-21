from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser
import logging

logger = logging.getLogger(__name__)

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'phone_number', 'date_of_birth', 'gender', 'country', 'password1', 'password2')

    def save(self, commit=True):
        try:
            user = super().save(commit=False)
            user.email = self.cleaned_data['email']
            user.username = self.cleaned_data['username']
            user.phone_number = self.cleaned_data['phone_number']
            user.date_of_birth = self.cleaned_data['date_of_birth']
            user.gender = self.cleaned_data['gender']
            user.country = self.cleaned_data['country']
            
            if commit:
                user.save()
                logger.info(f"User created successfully: ID={user.id}, Email={user.email}")
            return user
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 'gender', 'country', 'profile_picture')

class LoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)

class PasswordResetRequestForm(forms.Form):
    email = forms.EmailField()

class SetPasswordForm(forms.Form):
    new_password1 = forms.CharField(widget=forms.PasswordInput)
    new_password2 = forms.CharField(widget=forms.PasswordInput)

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('new_password1')
        password2 = cleaned_data.get('new_password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return cleaned_data


# New form for OTP verification
class OTPVerificationForm(forms.Form):
    otp = forms.CharField(max_length=6, min_length=6, required=True)

    def clean_otp(self):
        otp = self.cleaned_data['otp']
        if not otp.isdigit():
            raise forms.ValidationError("OTP must contain only digits.")
        return otp
