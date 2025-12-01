from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    CrearSolicitudProfesionalView,
    MiSolicitudProfesionalView,
    SolicitudesPendientesAdminView,
    GestionSolicitudProfesionalAdminView,
    AdminDashboardView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', ProfileView.as_view(), name='me'),

    # Solicitud profesional - Usuario normal
    path('solicitud-profesional/crear/', CrearSolicitudProfesionalView.as_view(), name='crear_solicitud_profesional'),
    path('solicitud-profesional/mia/', MiSolicitudProfesionalView.as_view(), name='mi_solicitud_profesional'),

    # Solicitud profesional - Admin
    path('solicitud-profesional/pendientes/', SolicitudesPendientesAdminView.as_view(), name='solicitudes_pendientes'),
    path('solicitud-profesional/gestionar/<int:pk>/', GestionSolicitudProfesionalAdminView.as_view(), name='gestionar_solicitud_profesional'),

    # Panel de admin
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
]