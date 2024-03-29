import requests
import datetime
import pytz
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render
from django.urls import reverse
from django.conf import settings
from django.contrib.auth import login, logout

import muse.models
from muse.models import Server
from users.models import DiscordUser

discord_config = settings.DISCORD_CONFIG

code_exchange_payload = {
    'client_id': discord_config['client_id'],
    'client_secret': discord_config['client_secret'],
    'grant_type': 'authorization_code',
    'redirect_uri': discord_config['redirect_uri']
}


def get_context(request, include_servers=False):
    context = {
        'personality': request.user.personality if hasattr(request.user, 'personality') else 'default'
    }
    if not request.user.is_anonymous:
        context.update({
            'name': request.user.name,
            'discriminator': request.user.discriminator,
            'avatar': request.user.avatar,
            'last_authenticated': request.user.last_authenticated,
            'locale': request.user.locale,
        })
        if include_servers:
            servers = {}
            for server in request.user.servers.all():
                servers[server.discord_id] = {
                    'name': server.name,
                    'owner': True if server.owner_id == request.user.username else False,
                    'is_admin': True if request.user in server.admins.all() else False
                }
            context.update({
                'servers': servers
            })
    return context


def authenticate(request):
    if not request.user.is_anonymous:
        return HttpResponseRedirect(reverse('dashboard'))

    # do code exchange
    code = request.GET.get('code')
    if code:
        code_exchange_payload['code'] = code
    else:
        return HttpResponseRedirect(reverse('index'))

    # Request the access token using the code challenge
    response = requests.request("POST", discord_config['token_url'], data=code_exchange_payload)

    if response.status_code != 200:
        return HttpResponse(
            status=response.status_code,
            content=render(request, context=response.json(), template_name='error.html')
        )

    access_token = response.json()['access_token']
    refresh_token = response.json()['refresh_token']
    expires_in = response.json()['expires_in']
    last_authenticated = datetime.datetime.now(tz=pytz.utc)
    expiry = last_authenticated + datetime.timedelta(seconds=expires_in)
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Request user details for user who signed in
    response = requests.request("GET", discord_config['current_user_endpoint'], headers=headers)

    if response.status_code == 200:
        response = response.json()
        discord_user, created = DiscordUser.objects.get_or_create(
            username=response['id'],
            name=response['username'],
            discriminator=response['discriminator'],
            email=response['email']
        )
    else:
        return HttpResponse(status=response.status_code, content=response.text)

    discord_user.access_token = access_token
    discord_user.refresh_token = refresh_token
    discord_user.verified = response['verified']
    discord_user.avatar = response['avatar']
    discord_user.locale = response['locale']
    discord_user.email = response['email']
    discord_user.last_authenticated = last_authenticated
    discord_user.expires = expiry
    discord_user.save()

    server_memberships = requests.request("GET", discord_config['current_user_guilds_endpoint'], headers=headers).json()

    for server in server_memberships:
        permissions = server['permissions']
        if permissions & 8 or permissions & 32:
            s, created = Server.objects.get_or_create(
                discord_id=server['id']
            )
            if server['owner']:
                s.owner_id = discord_user.username
            s.admins.add(discord_user)
            s.name = server['name']
            s.icon = server['icon']
            s.save()
        else:
            try:
                s = Server.objects.get(discord_id=server['id'])
                if discord_user in s.admins.all():
                    s.admins.remove(discord_user)
                if len(s.admins.all()) <= 0:
                    s.delete()
            except Server.DoesNotExist:
                pass
    login(request, discord_user)

    return HttpResponseRedirect(reverse('dashboard'))


def process_logout(request):
    if not request.user.is_anonymous:
        revoke_token(request.user)
        request.user.access_token = None
        request.user.refresh_token = None
        request.user.save()
        logout(request)


def revoke_token(discord_user):
    payload = {
        "client_id": discord_config["client_id"],
        "client_secret": discord_config["client_secret"],
        "token": discord_user.access_token
    }
    revoked = requests.request("POST", discord_config['revoke_url'], data=payload)
    return revoked
