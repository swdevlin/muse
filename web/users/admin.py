from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from users.models import DiscordUser


@admin.register(DiscordUser)
class UserAdmin(DjangoUserAdmin):
	pass
