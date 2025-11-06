from django.urls import path
from .views import CitasDisponiblesProfesionalView, MisCitasView, CrearCitaView, ReservarCitaView

urlpatterns = [
    path('profesional/<int:profesional_id>/disponibles/', CitasDisponiblesProfesionalView.as_view(), name='citas_disponibles'),
    path('mis-citas/', MisCitasView.as_view(), name='mis_citas'),
    path('crear/', CrearCitaView.as_view(), name='crear_cita'),
    path('<int:cita_id>/reservar/', ReservarCitaView.as_view(), name='reservar_cita'),
]