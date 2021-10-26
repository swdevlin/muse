from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from discord.auth import get_context, process_logout, discord
from .models import Topic
from .forms import PersonalityForm


def index(request):
    context = get_context(request)
    context.update({
        'page_title': 'Welcome',
        'page_text': 'This is still a work in progress and proof of concept.'
    })
    return render(request, f'index.html', context=context)


def profile(request):
    if request.POST and not request.user.is_anonymous:
        request.user.personality = request.POST.get('personality') or request.user.personality or 'default'
        request.user.save()
    context = get_context(request, include_servers=True)
    context.update({
        'page_title': 'My Profile',
        'form': PersonalityForm(context['personality'])
    })
    return render(request, f'profile.html', context=context)


def dashboard(request):
    if request.user.is_anonymous:
        return HttpResponseRedirect(reverse('login_with_discord'))
    context = get_context(request, include_servers=True)
    return render(request, f'dashboard.html', context=context)


def database(request):
    if request.user.is_anonymous:
        return HttpResponseRedirect(reverse('login_with_discord'))
    context = get_context(request, include_servers=True)
    topics = sorted(Topic.objects.all().filter(server__in=request.user.servers.all()), key=lambda t: t.key)
    total_topics = len(topics)
    topic_first_characters = sorted(set([t.title[0].lower() for t in topics]))
    context.update({
        'topics': {
            c: [
                {
                    'id': str(i + 1).zfill(len(str(total_topics))),
                    'title': topics[i].title,
                    'text': topics[i].text
                } for i in range(0, total_topics) if topics[i].title.lower().startswith(c.lower())
            ] for c in topic_first_characters
        },
        'topic_categories': [
            'skills',
            'places',
            'weapons',
            'vehicles',
            'factions',
        ]
    })
    return render(request, f'database.html', context=context)


def login(request):
    url_params = f"?client_id={discord['client_id']}&redirect_uri={discord['redirect_uri']}"
    return HttpResponseRedirect(
        discord['authorize_url'] + url_params + "&response_type=code&scope=identify%20email%20guilds")


def logout(request):
    context = get_context(request)
    context.update({
        'page_title': 'Logged Out',
        'page_text': '',
    })
    process_logout(request, context)
    return render(request, f'logout.html', context=context)
