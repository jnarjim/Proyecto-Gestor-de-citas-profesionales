# citas/urls.py
from django.urls import path
from .views import (
    CitasDisponiblesProfesionalView,
    MisCitasView,
    CrearCitaView,
    ReservarCitaView,
    CancelarCitaView,
    CompletarCitaView,
    EliminarCitaView,
    CitasDisponiblesGlobalView,
    CitaDetalleView,
)

urlpatterns = [
    path('profesional/<int:profesional_id>/disponibles/', CitasDisponiblesProfesionalView.as_view(), name='citas_disponibles'),
    path('mis-citas/', MisCitasView.as_view(), name='mis_citas_api'),
    path('crear/', CrearCitaView.as_view(), name='crear_cita'),
    path('<int:pk>/', CitaDetalleView.as_view(), name='detalle_cita_api'),
    path('<int:pk>/reservar/', ReservarCitaView.as_view(), name='reservar_cita'),
    path('<int:pk>/cancelar/', CancelarCitaView.as_view(), name='cancelar_cita'),
    path('<int:pk>/completar/', CompletarCitaView.as_view(), name='completar_cita'),
    path('<int:pk>/eliminar/', EliminarCitaView.as_view(), name='eliminar_cita'),
    path('disponibles/', CitasDisponiblesGlobalView.as_view(), name='citas_disponibles_global'),
]