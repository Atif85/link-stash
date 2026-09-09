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

    # Auth
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register_view, name="register"),
]
