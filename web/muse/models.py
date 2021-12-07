from django.db import models
from django.forms import TextInput, forms, Textarea, ModelForm
from django.utils import timezone
from django.contrib import admin

from users.models import DiscordUser


class Server(models.Model):
    class Meta:
        db_table = 'discord_server'

    discord_id = models.TextField(unique=True)
    owner_id = models.TextField(null=True)
    name = models.TextField()
    prefix = models.TextField(default='muse')
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


class Topic(models.Model):
    class Meta:
        db_table = 'topic'
        unique_together = ('server', 'key')
        indexes = [
            models.Index(name='parent_lookup', fields=['server', 'parent'], include=['title']),
            models.Index(name='topic_key', fields=['server', 'key'])
        ]

    title = models.TextField(null=False)
    key = models.TextField(null=False)
    text = models.TextField(null=True)
    modified = models.BooleanField(default=False)
    custom = models.BooleanField(default=False)
    alias_for = models.TextField(null=True)
    server = models.ForeignKey(Server, on_delete=models.CASCADE)
    parent = models.TextField(null=True)
    page = models.TextField(null=True)
    wiki_slug = models.TextField(null=True)
    image = models.TextField(null=True)
    category = models.TextField(null=True)

    def __str__(self):
        return f'{self.title} ({self.key})'


class TopicAdminForm(ModelForm):
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
        model = Topic
        exclude = []


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    form = TopicAdminForm


class CampaignJobsLog(models.Model):
    class Meta:
        db_table = 'campaign_jobs'

    server = models.ForeignKey(Server, on_delete=models.CASCADE)
    last_error = models.TextField(null=True)
    results = models.TextField(null=True)
    filename = models.TextField(null=True)
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True)


@admin.register(CampaignJobsLog)
class CampaignJobsLogAdmin(admin.ModelAdmin):
    list_display = ('server', 'created_at', 'completed_at', 'filename')
    ordering = ('-created_at',)
    list_filter = ('server',)
    formfield_overrides = {
        models.TextField: {'widget': TextInput}
    }
