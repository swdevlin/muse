from django.contrib import admin
from django.db import models
from django.forms import TextInput
from django.utils import timezone

from users.models import DiscordUser


class Server(models.Model):
    class Meta:
        db_table = 'discord_server'

    discord_id = models.TextField(unique=True)
    owner_id = models.TextField(null=True)
    name = models.TextField()
    joined_at = models.DateTimeField(default=timezone.now)
    icon = models.TextField(null=True)
    wiki_url = models.URLField(null=True)

    admins = models.ManyToManyField(DiscordUser, related_name='servers')

    def __str__(self):
        return f'{self.name} ({self.discord_id})'


@admin.register(Server)
class ServerAdmin(admin.ModelAdmin):
    formfield_overrides = {
        models.TextField: {'widget': TextInput}
    }


