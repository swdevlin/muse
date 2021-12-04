from django.db import models
from django.utils import timezone

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


class CampaignJobsLog(models.Model):
    class Meta:
        db_table = 'campaign_jobs'

    server = models.ForeignKey(Server, on_delete=models.CASCADE)
    last_error = models.TextField(null=True)
    results = models.TextField(null=True)
    filename = models.TextField(null=True)
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True)

