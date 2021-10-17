from django.db import models
from django.contrib.auth.models import AbstractUser


class DiscordUser(AbstractUser):
    username = models.CharField(max_length=254, unique=True)  # Discord ID
    name = models.CharField(max_length=254, blank=True, null=True)  # Discord Username
    discriminator = models.CharField(max_length=5, blank=True, null=True)
    access_token = models.CharField(max_length=254, blank=True, null=True)
    refresh_token = models.CharField(max_length=254, blank=True, null=True)
    verified = models.BooleanField(blank=True, null=True)
    avatar = models.CharField(max_length=254, blank=True, null=True)
    locale = models.CharField(max_length=254, blank=True, null=True)
    joined_at = models.DateTimeField('joined_at', blank=True, null=True)
    last_authenticated = models.DateTimeField('last_authenticated', blank=True, null=True)
    expires = models.DateTimeField('access_token_expiry', blank=True, null=True)
    server_permissions = models.JSONField(default=dict, null=True)

    def __str__(self):
        return f'{self.name}#{self.discriminator}'
