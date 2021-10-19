from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from discord.auth import get_context, process_logout, discord


def index(request):
    context = get_context(request)
    context.update({
        'page_title': 'Welcome',
        'page_text': 'This is still a work in progress and proof of concept.'
    })
    return render(request, 'index.html', context=context)


def profile(request):
    context = get_context(request, include_servers=True)
    context.update({
        'page_title': 'My Profile'
    })
    return render(request, 'profile.html', context=context)


def dashboard(request):
    if request.user.is_anonymous:
        return HttpResponseRedirect(reverse('login_with_discord'))
    context = get_context(request, include_servers=True)
    return render(request, 'dashboard.html', context=context)


def login(request):
    url_params = f"?client_id={discord['client_id']}&redirect_uri={discord['redirect_uri']}"
    return HttpResponseRedirect(
        discord['authorize_url'] + url_params + "&response_type=code&scope=identify%20email%20guilds")


def logout(request):
    context = {
        'page_title': 'Logged Out',
        'page_text': ''
    }
    process_logout(request, context)
    return render(request, 'logout.html', context=context)
