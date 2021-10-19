from django.urls import path

from . import views

urlpatterns = [
    path('', views.index),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('profile/', views.profile, name='profile'),
    path('login/', views.login, name='login_with_discord'),
    path('logout/', views.logout, name='logout')
]
