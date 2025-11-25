from django.urls import path
from .views import (
    ListNotificacionesView,
    DetalleNotificacionView,
    MarcarNotificacionLeidaView,
    EliminarNotificacionView
)

urlpatterns = [
    path('', ListNotificacionesView.as_view(), name='listar_notificaciones'),
    path('<int:pk>/', DetalleNotificacionView.as_view(), name='detalle_notificacion'),
    path('<int:pk>/marcar-leida/', MarcarNotificacionLeidaView.as_view(), name='marcar_notificacion_leida'),
    path('<int:pk>/eliminar/', EliminarNotificacionView.as_view(), name='eliminar_notificacion'),
]