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
from django.shortcuts import render
from django.urls import path, include
from citas import views as citas_views

urlpatterns = [
    # Frontend
    path('', citas_views.index, name='index'),
    path('mis-citas/', lambda request: render(request, 'citas/listar_citas.html'), name='listar_citas'),
    path('registro/', lambda request: render(request, 'usuarios/registro.html'), name='registro_frontend'),
    path('login/', lambda request: render(request, 'usuarios/login.html'), name='login_frontend'),
    path('cita/<int:id>/', citas_views.detalle_cita, name='detalle_cita'),
    path('crear-cita/', citas_views.crear_cita, name='crear_cita'),
    path('citas-disponibles/', citas_views.citas_disponibles, name='citas_disponibles'),
    path('citas/historial/', lambda request: render(request, 'citas/historial_citas.html'), name='historial_citas'),
    path('panel-profesional/', lambda request: render(request, 'profesional/panel_profesional.html'), name='panel_profesional'),
    path('notificaciones/', lambda request: render(request, 'notificaciones/listar_notificaciones.html'), name='listar_notificaciones'),
    path('usuarios/solicitud-profesional/crear/', lambda request: render(request, 'usuarios/solicitud_profesional.html'), name='solicitud_profesional_crear'),
    path('usuarios/solicitud-profesional/mia/', lambda request: render(request, 'usuarios/solicitud_profesional.html'), name='solicitud_profesional_mia'),
    path('perfil/', lambda request: render(request, 'usuarios/perfil.html'), name='perfil'),

    # APIs
    path('api/usuarios/', include('usuarios.urls')),
    path('api/citas/', include('citas.urls')),
    path('api/notificaciones/', include('notificaciones.urls')),

    # Admin
    path('admin/', admin.site.urls),
    path('usuarios/admin/dashboard/', lambda request: render(request, 'usuarios/admin.html'), name='admin_dashboard'),
]