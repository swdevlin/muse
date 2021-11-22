from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path(r'dashboard/', views.dashboard, name='dashboard'),
    path(r'profile/', views.profile, name='profile'),
    path(r'login/', views.login, name='login-with-discord'),
    path(r'logout/', views.logout, name='logout'),
    path(r'database/', views.database, name='database')
]
