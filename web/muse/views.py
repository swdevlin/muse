from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from discord.auth import get_context, process_logout, discord_config
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
        return HttpResponseRedirect(reverse('login-with-discord'))
    context = get_context(request, include_servers=True)
    return render(request, f'dashboard.html', context=context)


def database(request):
    if request.user.is_anonymous:
        return HttpResponseRedirect(reverse('login-with-discord'))
    context = get_context(request, include_servers=True)
    for server in context['servers']:
        server_topics = sorted(Topic.objects.all().filter(server__discord_id=server), key=lambda t: t.key)
        total_topics = len(server_topics)
        topic_first_characters = sorted(set([t.title[0].lower() for t in server_topics]))
        context['servers'][f'{server}'].update({
                'topics': {
                    c: [
                        {
                            'id': str(i + 1).zfill(len(str(total_topics))),
                            'title': server_topics[i].title,
                            'text': server_topics[i].text
                        } for i in range(0, total_topics) if server_topics[i].title.lower().startswith(c.lower())
                    ] for c in topic_first_characters
                },
                'total_topics': total_topics,
                'topic_first_characters': topic_first_characters
        })

    categories = [
        'skills',
        'places',
        'weapons',
        'vehicles',
        'factions',
    ]
    context.update({
        'topic_categories': categories
    })
    return render(request, f'database.html', context=context)


def login(request):
    url_params = f"?client_id={discord_config['client_id']}&redirect_uri={discord_config['redirect_uri']}"
    return HttpResponseRedirect(
        discord_config['authorize_url'] + url_params + "&response_type=code&scope=identify%20email%20guilds")


def logout(request):
    context = get_context(request)
    context.update({
        'page_title': 'Logged Out',
        'page_text': '',
    })
    process_logout(request, context)
    return render(request, f'logout.html', context=context)
