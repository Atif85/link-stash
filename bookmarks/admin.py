from django.contrib import admin

from bookmarks.models import User, Folder, Bookmark

# Register your models here.
admin.site.register(User)
admin.site.register(Folder)
admin.site.register(Bookmark)