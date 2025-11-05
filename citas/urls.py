from django.urls import path
from .views import CitasDisponiblesProfesionalView, MisCitasView

urlpatterns = [
    path('profesional/<int:profesional_id>/disponibles/', CitasDisponiblesProfesionalView.as_view(), name='citas_disponibles'),
    path('mis-citas/', MisCitasView.as_view(), name='mis_citas'),
]