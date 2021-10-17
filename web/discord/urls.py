from django.urls import include, path

from . import views, auth

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login, name='login_with_discord'),
    path('authenticate/', auth.authenticate, name='discord_authentication'),
    path('logout/', views.logout, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('profile/', views.profile, name='profile'),
]