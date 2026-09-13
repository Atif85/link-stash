from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),

    # Api
    path("api/stash/", views.get_stash_data, name="stash_data"),
    
    path("api/bookmarks/create/", views.create_bookmark, name="create_bookmark"),
    path(
        "api/bookmarks/edit/<int:bookmark_id>/",
        views.edit_bookmark,
        name="edit_bookmark",
    ),
    path(
        "api/bookmarks/delete/<int:bookmark_id>/",
        views.delete_bookmark,
        name="delete_bookmark",
    ),

    path("api/folders/create/", views.create_folder, name="create_folder"),
    path("api/folders/edit/<int:folder_id>/", views.edit_folder, name="edit_folder"),
    path(
        "api/folders/delete/<int:folder_id>/", views.delete_folder, name="delete_folder"
    ),

    # Auth
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register_view, name="register"),
]
