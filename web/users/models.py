from django.db import models
from django.contrib.auth.models import AbstractUser


class DiscordUser(AbstractUser):
    username = models.TextField(unique=True)  # Discord ID
    name = models.TextField(blank=True, null=True)  # Discord Username
    discriminator = models.TextField(blank=True, null=True)
    access_token = models.TextField(blank=True, null=True)
    refresh_token = models.TextField(blank=True, null=True)
    verified = models.BooleanField(blank=True, null=True)
    avatar = models.TextField(blank=True, null=True)
    locale = models.TextField(blank=True, null=True)
    joined_at = models.DateTimeField('joined_at', blank=True, null=True)
    last_authenticated = models.DateTimeField('last_authenticated', blank=True, null=True)
    expires = models.DateTimeField('access_token_expiry', blank=True, null=True)
    server_permissions = models.JSONField(default=dict, null=True)

    def __str__(self):
        return f'{self.name}#{self.discriminator}'
