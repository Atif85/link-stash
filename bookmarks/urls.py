from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),

    # Api
    path("api/stash/", views.get_stash_data, name="stash_data"),

    # Auth
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register_view, name="register"),
]
