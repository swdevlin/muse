from django.contrib import admin
from django.db import models
from django.forms import TextInput
from django.utils import timezone

from muse.models.server import Server


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
