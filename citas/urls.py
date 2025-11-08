from django.urls import path
from .views import CitasDisponiblesProfesionalView, MisCitasView, CrearCitaView, ReservarCitaView, CancelarCitaView, CompletarCitaView, CitasDisponiblesGlobalView

urlpatterns = [
    path('profesional/<int:profesional_id>/disponibles/', CitasDisponiblesProfesionalView.as_view(), name='citas_disponibles'),
    path('mis-citas/', MisCitasView.as_view(), name='mis_citas'),
    path('crear/', CrearCitaView.as_view(), name='crear_cita'),
    path('<int:cita_id>/reservar/', ReservarCitaView.as_view(), name='reservar_cita'),
    path('<int:cita_id>/cancelar/', CancelarCitaView.as_view(), name='cancelar_cita'),
    path('<int:cita_id>/completar/', CompletarCitaView.as_view(), name='completar_cita'),
    path('disponibles/', CitasDisponiblesGlobalView.as_view(), name='citas_disponibles_global'),
]