import json
import urllib
from django.shortcuts import redirect, render
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseNotAllowed, JsonResponse

from bookmarks.forms import LoginForm, RegisterForm

from .models import User, Folder, Bookmark


@login_required
def index(request):
    return render(request, "bookmarks/index.html")


# Bookmark Api
@login_required
def create_bookmark(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    # Parse Json
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid Json"}, status=400)

    try:
        user = request.user

        cleaned, errors = _validate_bookmark_input(data, isEdit=False)
        if errors:
            return JsonResponse({"success": False, "errors": errors}, status=400)

        # Get parent folder
        parent_folder = Folder.objects.filter(
            id=cleaned["folder_id"], user=user
        ).first()
        if not parent_folder:
            return JsonResponse(
                {"success": False, "errors": {"folder": "Parent folder id not found."}},
                status=404,
            )

        # Create new bookmark
        new_bookmark = Bookmark.objects.create(
            title=cleaned["title"], url=cleaned["url"], folder=parent_folder
        )
        new_bookmark.save()

        # Update child_order of parent folder
        if parent_folder.children_order is None:
            parent_folder.children_order = []

        bookmark_identifier = f"b_{new_bookmark.id}"

        parent_folder.children_order.append(bookmark_identifier)
        parent_folder.save()

        return JsonResponse(
            {
                "success": True,
                "bookmark": _serialize_bookmark(new_bookmark),
            },
            status=201,
        )

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@login_required
def edit_bookmark(request, bookmark_id):
    if request.method != "PATCH":
        return HttpResponseNotAllowed(["PATCH"])

    # Parse Json
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid Json"}, status=400)

    try:
        user = request.user

        cleaned, errors = _validate_bookmark_input(data, isEdit=True)
        if errors:
            return JsonResponse({"success": False, "errors": errors}, status=400)

        folder_id = cleaned["folder_id"]
        new_folder_id = cleaned["new_folder_id"]

        # Find the bookmark
        bookmark = Bookmark.objects.filter(
            id=bookmark_id,
            folder__id=folder_id,
            folder__user=user,
        ).first()

        if not bookmark:
            return JsonResponse(
                {"success": False, "errors": {"bookmark": "Bookmark not found."}},
                status=404,
            )

        # Check if parent folder was changed.
        if folder_id != new_folder_id:
            old_parent_folder = Folder.objects.filter(id=folder_id, user=user).first()

            new_parent_folder = Folder.objects.filter(
                id=new_folder_id, user=user
            ).first()

            if not old_parent_folder or not new_parent_folder:
                return JsonResponse(
                    {"success": False, "errors": {"folder": "Folder not found."}},
                    status=404,
                )

            bookmark_identifier = f"b_{bookmark_id}"

            # Remove bookmark from old parent folder's children_order
            if old_parent_folder.children_order:
                # Rebuild whole list to remove any duplicates too
                old_parent_folder.children_order = [
                    child_id
                    for child_id in old_parent_folder.children_order
                    if child_id != bookmark_identifier
                ]
                old_parent_folder.save()

            # Add bookmark to new parent folder's children_order
            if new_parent_folder.children_order is None:
                new_parent_folder.children_order = []
            new_parent_folder.children_order.append(bookmark_identifier)
            new_parent_folder.save()

        bookmark.title = cleaned["title"]
        bookmark.url = cleaned["url"]
        bookmark.folder_id = new_folder_id
        bookmark.save()

        return JsonResponse(
            {
                "success": True,
                "bookmark": _serialize_bookmark(bookmark),
            },
            status=200,
        )

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@login_required
def delete_bookmark(request, bookmark_id):
    if request.method != "DELETE":
        return HttpResponseNotAllowed(["DELETE"])

    try:
        user = request.user

        bookmark = Bookmark.objects.filter(
            id=bookmark_id,
            folder__user=user,
        ).first()

        if not bookmark:
            return JsonResponse(
                {"success": False, "errors": {"bookmark": "Bookmark not found."}},
                status=404,
            )

        folder = bookmark.folder
        bookmark_identifier = f"b_{bookmark.id}"

        bookmark.delete()

        # Remove bookmark from its folder's children_order
        if folder.children_order:
            folder.children_order = [
                child_id
                for child_id in folder.children_order
                if child_id != bookmark_identifier
            ]
            folder.save()

        return JsonResponse({"success": True}, status=200)

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


# Folder Api
@login_required
def create_folder(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    # Parse Json
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid Json"}, status=400)

    try:
        user = request.user

        cleaned, errors = _validate_folder_input(data, isEdit=False)
        if errors:
            return JsonResponse({"success": False, "errors": errors}, status=400)

        # Get parent folder
        parent_folder = Folder.objects.filter(
            id=cleaned["parent_id"], user=user
        ).first()
        if not parent_folder:
            return JsonResponse(
                {"success": False, "errors": {"folder": "Parent folder id not found."}},
                status=404,
            )

        # Create new folder
        new_folder = Folder.objects.create(
            name=cleaned["name"], user=user, parent=parent_folder
        )
        new_folder.save()

        # Update child_order of parent folder
        if parent_folder.children_order is None:
            parent_folder.children_order = []

        folder_identifier = f"f_{new_folder.id}"

        parent_folder.children_order.append(folder_identifier)
        parent_folder.save()

        return JsonResponse(
            {
                "success": True,
                "folder": _serialize_folder(new_folder),
            },
            status=201,
        )

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@login_required
def edit_folder(request, folder_id):
    if request.method != "PATCH":
        return HttpResponseNotAllowed(["PATCH"])

    # Parse Json
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid Json"}, status=400)

    try:
        user = request.user

        cleaned, errors = _validate_folder_input(data, isEdit=True)
        if errors:
            return JsonResponse({"success": False, "errors": errors}, status=400)

        parent_id = cleaned["parent_id"]
        new_parent_id = cleaned["new_parent_id"]

        # Find the folder
        folder = Folder.objects.filter(
            id=folder_id,
            parent__id=parent_id,
            user=user,
        ).first()

        if not folder:
            return JsonResponse(
                {"success": False, "errors": {"folder": "Folder not found."}},
                status=404,
            )

        # Check if parent folder was changed.
        if parent_id != new_parent_id:
            old_parent_folder = Folder.objects.filter(id=parent_id, user=user).first()

            new_parent_folder = Folder.objects.filter(
                id=new_parent_id, user=user
            ).first()

            if not old_parent_folder or not new_parent_folder:
                return JsonResponse(
                    {"success": False, "errors": {"folder": "Parent folder not found."}},
                    status=404,
                )

            folder_identifier = f"f_{folder_id}"

            # Remove folder from old parent folder's children_order
            if old_parent_folder.children_order:
                # Rebuild whole list to remove any duplicates too
                old_parent_folder.children_order = [
                    child_id
                    for child_id in old_parent_folder.children_order
                    if child_id != folder_identifier
                ]
                old_parent_folder.save()

            # Add bookmark to new parent folder's children_order
            if new_parent_folder.children_order is None:
                new_parent_folder.children_order = []
            new_parent_folder.children_order.append(folder_identifier)
            new_parent_folder.save()

            # Update parent folder 
            folder.parent = new_parent_folder

        folder.name = cleaned["name"]

        if "children_order" in cleaned:
            folder.children_order = cleaned["children_order"]

        folder.save()

        return JsonResponse(
            {
                "success": True,
                "folder": _serialize_folder(folder),
            },
            status=200,
        )

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@login_required
def delete_folder(request, folder_id):
    if request.method != "DELETE":
        return HttpResponseNotAllowed(["DELETE"])

    try:
        user = request.user

        folder = Folder.objects.filter(
            id=folder_id,
            user=user,
        ).first()

        if not folder:
            return JsonResponse(
                {"success": False, "errors": {"folder": "Folder not found."}},
                status=404,
            )

        parent_folder = folder.parent
        folder_identifier = f"f_{folder.id}"

        folder.delete()

        # Remove bookmark from its folder's children_order
        if parent_folder.children_order:
            parent_folder.children_order = [
                child_id
                for child_id in parent_folder.children_order
                if child_id != folder_identifier
            ]
            parent_folder.save()

        return JsonResponse({"success": True}, status=200)

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


# Stash Api
@login_required
def get_stash_data(request):
    # Get the folders and bookmarks
    folders = Folder.objects.filter(user=request.user)
    bookmarks = Bookmark.objects.filter(folder__in=folders)

    # Serialize to lists
    folders_list = []
    for folder in folders:
        folders_list.append(_serialize_folder(folder))

    bookmarks_list = []
    for bookmark in bookmarks:
        bookmarks_list.append(_serialize_bookmark(bookmark))

    return JsonResponse({"folders": folders_list, "bookmarks": bookmarks_list})


# Auth
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


def _validate_bookmark_input(data, isEdit):
    title_input = data.get("title", "").strip()
    url_input = data.get("url", "").strip()
    folder_id = data.get("folder_id")

    if not url_input:
        return None, {"url": "URL is required."}

    if not folder_id:
        return None, {"folder": "FolderId is required."}

    # If no title was given, use url as title
    if not title_input:
        title_input = url_input

    # Parse url
    parsed_url = urllib.parse.urlparse(url_input)
    if not parsed_url.scheme:
        url_input = "https://" + url_input

    cleaned_data = {
        "title": title_input,
        "url": url_input,
        "folder_id": folder_id,
    }

    if isEdit:
        new_folder_id = data.get("new_folder_id")
        if not new_folder_id:
            new_folder_id = folder_id
        cleaned_data["new_folder_id"] = new_folder_id

    return cleaned_data, None


def _serialize_bookmark(bookmark):
    return {
        "id": bookmark.id,
        "title": bookmark.title,
        "url": bookmark.url,
        "folder_id": bookmark.folder_id,
        "created_at": bookmark.created_at,
        "favicon_url": bookmark.favicon_url,
    }


def _validate_folder_input(data, isEdit):
    name_input = data.get("name", "").strip()
    parent_id = data.get("parent_id")

    if not name_input:
        return None, {"name": "Name is required."}

    if not parent_id:
        return None, {"parent": "ParentId is required."}

    cleaned_data = {
        "name": name_input,
        "parent_id": parent_id,
    }

    if isEdit:
        new_parent_id = data.get("new_parent_id")
        if not new_parent_id:
            new_parent_id = parent_id
        cleaned_data["new_parent_id"] = new_parent_id

        children_order = data.get("children_order")
        if children_order is not None:
            cleaned_data["children_order"] = children_order

    return cleaned_data, None


def _serialize_folder(folder):
    return {
        "id": folder.id,
        "name": folder.name,
        "parent_id": folder.parent_id,
        "children_order": folder.children_order,
    }
