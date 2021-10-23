from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from discord.auth import get_context, process_logout, discord
from .models import Topic
from .forms import PersonalityForm

sample_text = 'bacon ipsum dolor amet leberkas porchetta in dolore jerky rump tenderloin velit brisket occaecat ' \
              'lorem short loin aliquip culpa. cow culpa beef ribs do ea turkey venison pork belly veniam aliqua ut. ' \
              'veniam tongue drumstick ham pork pancetta. landjaeger voluptate laborum sausage cow leberkas chislic ' \
              'veniam ut. tempor ut ipsum adipisicing frankfurter. occaecat bacon qui jowl et aliqua esse culpa aute ' \
              'bresaola. jowl bresaola andouille, anim culpa filet mignon eiusmod jerky labore fatback pork chop ' \
              'boudin ullamco.\n\n' \
              'sed nulla ut landjaeger pork belly nisi, incididunt beef ribs leberkas. dolor deserunt commodo beef ' \
              'ribs. qui aute filet mignon rump cupim dolor, turkey sint in pork. beef enim boudin magna spare ribs ' \
              'id sint ullamco et lorem pork loin sausage kielbasa.\n\n' \
              'hamburger alcatra est leberkas pork pancetta jowl ipsum aliquip. corned beef occaecat kevin duis ' \
              'prosciutto eiusmod ad ipsum pork chop tongue ball tip elit culpa. corned beef occaecat kevin duis ' \
              'occaecat kevin duis prosciutto eiusmod ad ipsum pork chop tongue ball tip elit culpa.\n\n'

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
    if not request.user.is_anonymous:
        personality = request.user.personality
    else:
        personality = 'default'
    context = get_context(request, include_servers=True)
    context.update({
        'page_title': 'My Profile',
        'form': PersonalityForm(personality)
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
    topics = Topic.objects.filter(server_id=request.user.servers.all().first())
    context.update({
        'topics': [
            {
                'title': topics[i].title,
                'text': topics[i].text
            } for i in range(0, len(topics))
        ]
    })
    context.update({
    #     'topics': [
    #         {
    #             'id': '001',
    #             'title': 'First topic',
    #             'text': sample_text
    #         },
    #         {
    #             'id': '002',
    #             'title': 'Second topic',
    #             'text': sample_text
    #         },
    #         {
    #             'id': '003',
    #             'title': 'Third topic',
    #             'text': sample_text
    #         },
    #         {
    #             'id': '004',
    #             'title': 'Fourth topic',
    #             'text': sample_text
    #         },
    #         {
    #             'id': '005',
    #             'title': 'Fifth topic',
    #             'text': sample_text
    #         }
    #     ],
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
