"""
URL configuration for gestor_citas project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render

urlpatterns = [
    path('admin/', admin.site.urls),

    # frontend
    path('', lambda request: render(request, 'index.html'), name='index'),
    path('mis-citas/', lambda request: render(request, 'citas/listar_citas.html'), name='listar_citas'),
    path('registro/', lambda request: render(request, 'usuarios/registro.html'), name='registro_frontend'),
    path('login/', lambda request: render(request, 'usuarios/login.html'), name='login_frontend'),
    path('cita/<int:cita_id>/', lambda r, cita_id: render(r, 'citas/detalle_cita.html'), name='detalle_cita'),
    path('crear-cita/', lambda  request: render(request, 'citas/crear_cita.html'), name='crear_cita'),
    path('citas-disponibles/', lambda request: render(request, 'citas/citas_disponibles.html'), name='citas_disponibles'),


    # APIs
    path('api/usuarios/', include('usuarios.urls')),
    path('api/citas/', include('citas.urls')),
    path('api/notificaciones/', include('notificaciones.urls')),
]