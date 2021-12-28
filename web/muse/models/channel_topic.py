from django.contrib import admin
from django.db import models
from django.forms import TextInput, ModelForm

from muse.models import Channel


class ChannelTopic(models.Model):
    class Meta:
        db_table = 'channel_topic'
        unique_together = ('channel', 'key')
        indexes = [
            models.Index(name='channel_parent_lookup', fields=['channel', 'parent'], include=['title']),
            models.Index(name='channel_topic_key', fields=['channel', 'key'])
        ]

    title = models.TextField(null=False)
    key = models.TextField(null=False)
    text = models.TextField(null=True)
    alias_for = models.TextField(null=True)
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE)
    parent = models.TextField(null=True)
    page = models.TextField(null=True)
    wiki_slug = models.TextField(null=True)
    image = models.TextField(null=True)
    category = models.TextField(null=True)

    def __str__(self):
        return f'{self.title} ({self.key})'


class ChannelTopicAdminForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['key'].widget = TextInput()
        self.fields['title'].widget = TextInput()
        self.fields['alias_for'].widget = TextInput()
        self.fields['parent'].widget = TextInput()
        self.fields['page'].widget = TextInput()
        self.fields['wiki_slug'].widget = TextInput()
        self.fields['image'].widget = TextInput()
        self.fields['category'].widget = TextInput()

    class Meta:
        model = ChannelTopic
        exclude = []


@admin.register(ChannelTopic)
class ChannelTopicAdmin(admin.ModelAdmin):
    readonly_fields = ('server',)
    form = ChannelTopicAdminForm
    list_display = ('key', 'title', 'server', 'channel')
    list_filter = ('channel__server', 'channel', 'category')
    ordering = ('channel__server', 'channel', 'key',)

    def server(self, obj):
        return obj.channel.server.discord_id
