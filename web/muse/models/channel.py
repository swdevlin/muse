from django.contrib import admin
from django.db import models
from django.forms import TextInput

from muse.models import Server, Personalities


class Channel(models.Model):
    class Meta:
        db_table = 'channel'

    channel_id = models.TextField(unique=True)
    server = models.ForeignKey(Server, on_delete=models.CASCADE)
    name = models.TextField()
    prefix = models.TextField(default='muse')
    personality = models.IntegerField(null=True, choices=Personalities.choices)
    icon = models.TextField(null=True)
    wiki_url = models.URLField(null=True)

    def __str__(self):
        return f'{self.name} ({self.channel_id})'


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    readonly_fields = ('server',)
    formfield_overrides = {
        models.TextField: {'widget': TextInput}
    }
    list_display = ('id', 'server', 'channel_id', 'name', 'personality', 'prefix')

    def server(self, obj):
        return obj.server.discord_id
