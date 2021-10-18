from django.urls import path

from . import auth

urlpatterns = [
    path('authenticate/', auth.authenticate, name='discord_authentication')
]
