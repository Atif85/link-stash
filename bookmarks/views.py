from django.shortcuts import redirect, render
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

from bookmarks.forms import LoginForm, RegisterForm

from .models import User, Folder, Bookmark


@login_required
def index(request):
    return render(request, "bookmarks/index.html")


@login_required
def get_stash_data(request):
    # Get the folders and bookmarks
    folders = Folder.objects.filter(user=request.user)
    bookmarks = Bookmark.objects.filter(folder__in=folders)

    # Serialize to lists
    folders_list = []
    for folder in folders:
        folders_list.append(
            {
                "id": folder.id,
                "name": folder.name,
                "parent_id": folder.parent_id,
                "children_order": folder.children_order,
            }
        )

    bookmarks_list = []
    for bookmark in bookmarks:
        bookmarks_list.append(
            {
                "id": bookmark.id,
                "title": bookmark.title,
                "url": bookmark.url,
                "folder_id": bookmark.folder_id,
                "created_at": bookmark.created_at,
                "favicon_url": bookmark.favicon_url,
            }
        )

    return JsonResponse({"folders": folders_list, "bookmarks": bookmarks_list})


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

            # Create the root folder for this user
            root_folder = Folder(name="Root", user=user, parent=None)
            root_folder.save()

            login(request, user)
            return redirect("index")
        else:
            return render(request, "bookmarks/register.html", {"form": form})

    return render(request, "bookmarks/register.html", {"form": RegisterForm()})
