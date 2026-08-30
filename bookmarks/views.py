from django.shortcuts import redirect, render
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required

from bookmarks.forms import LoginForm, RegisterForm

from .models import User


@login_required
def index(request):
    return render(request, "bookmarks/index.html")


def login_view(request):
    if request.user.is_authenticated:
        return redirect("index")

    if request.method == "POST":
        form = LoginForm(request.POST, request=request)

        if form.is_valid():
            login(request, form.user_cache)
            return redirect("index")
        else:
            return render(request, "bookmarks/login.html", {"form": form})

    elif request.method == "GET":
        return render(
            request, "bookmarks/login.html", {"form": LoginForm(request=request)}
        )


def logout_view(request):
    logout(request)
    return redirect("index")


def register_view(request):
    if request.method == "POST":

        form = RegisterForm(request.POST)

        if form.is_valid():
            # Create new user
            user = User.objects.create_user(
                username=form.cleaned_data["username"],
                email=form.cleaned_data["email"],
                password=form.cleaned_data["password"],
            )

            user.save()

            login(request, user)
            return redirect("index")
        else:
            return render(request, "bookmarks/register.html", {"form": form})

    return render(request, "bookmarks/register.html", {"form": RegisterForm()})
