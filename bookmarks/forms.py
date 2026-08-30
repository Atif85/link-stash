from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate
from .models import User


class RegisterForm(forms.Form):
    username = forms.CharField(
        min_length=3,
        widget=forms.TextInput(
            attrs={"class": "form-control", "autofocus": "autofocus"}
        ),
    )

    email = forms.EmailField(widget=forms.EmailInput(attrs={"class": "form-control"}))

    password = forms.CharField(
        min_length=4, widget=forms.PasswordInput(attrs={"class": "form-control"})
    )

    confirm = forms.CharField(
        min_length=4, widget=forms.PasswordInput(attrs={"class": "form-control"})
    )

    def clean_username(self):
        username = self.cleaned_data.get("username")

        if User.objects.filter(username=username).exists():
            raise ValidationError("This username is already taken.")

        return username

    def clean_email(self):
        email = self.cleaned_data.get("email")

        if User.objects.filter(email=email).exists():
            raise ValidationError("This email is already registered.")

        return email

    def clean(self):
        cleaned_data = super().clean()

        password = cleaned_data.get("password")
        confirm = cleaned_data.get("confirm")

        if password != confirm:
            raise ValidationError("Passwords do not match.")

        return cleaned_data


class LoginForm(forms.Form):
    username = forms.CharField(
        min_length=3,
        widget=forms.TextInput(
            attrs={"class": "form-control", "autofocus": "autofocus"}
        ),
    )

    password = forms.CharField(
        min_length=4, widget=forms.PasswordInput(attrs={"class": "form-control"})
    )

    def __init__(self, *args, **kwargs):
        # Save the request object so can be passed to authenticate in 'clean'
        self.request = kwargs.pop("request", None)
        
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super().clean()

        username = cleaned_data.get("username")
        password = cleaned_data.get("password")

        if username and password:
            user = authenticate(self.request, username=username, password=password)

            if user is None:
                raise ValidationError("Invalid username and/or password.")

            self.user_cache = user

        return cleaned_data
