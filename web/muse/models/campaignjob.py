from django.contrib import admin
from django.db import models
from django.forms import TextInput
from django.utils import timezone

from muse.models import Channel


class CampaignJobsLog(models.Model):
    class Meta:
        db_table = 'campaign_jobs'

    channel = models.ForeignKey(Channel, on_delete=models.CASCADE)
    last_error = models.TextField(null=True)
    results = models.TextField(null=True)
    filename = models.TextField(null=True)
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True)


@admin.register(CampaignJobsLog)
class CampaignJobsLogAdmin(admin.ModelAdmin):
    readonly_fields = ('server',)
    list_display = ('server', 'created_at', 'completed_at', 'filename')
    ordering = ('-created_at',)
    list_filter = ('channel_id',)
    formfield_overrides = {
        models.TextField: {'widget': TextInput}
    }

    def server(self, obj):
        return obj.channel.server.discord_id
