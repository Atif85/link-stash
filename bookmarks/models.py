from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass


class Folder(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="folders")

    parent = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.CASCADE, related_name="children"
    )

    children_order = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.name


class Bookmark(models.Model):
    title = models.CharField(max_length=255)
    url = models.URLField()

    folder = models.ForeignKey(
        Folder,
        on_delete=models.CASCADE,
        related_name="bookmarks",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    favicon_url = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.title
