from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied

from .serializers import RegisterSerializer, UserSerializer, SolicitudProfesionalSerializer, SolicitudProfesionalAdminSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .token_serializers import MyTokenObtainPairSerializer
from .models import SolicitudProfesional
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Usuario creado correctamente"},
            status=status.HTTP_201_CREATED
        )

class LoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

# --------------------------------------------------------
# 1️⃣ Usuario normal - Enviar una solicitud
# --------------------------------------------------------
class CrearSolicitudProfesionalView(generics.CreateAPIView):
    serializer_class = SolicitudProfesionalSerializer
    permission_classes = [permissions.IsAuthenticated]


# --------------------------------------------------------
# 2️⃣ Usuario normal - Ver su solicitud
# --------------------------------------------------------
class MiSolicitudProfesionalView(generics.RetrieveAPIView):
    serializer_class = SolicitudProfesionalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        usuario = self.request.user
        try:
            return SolicitudProfesional.objects.get(usuario=usuario)
        except SolicitudProfesional.DoesNotExist:
            raise PermissionDenied("No tienes ninguna solicitud enviada.")


# --------------------------------------------------------
# 3️⃣ Admin - Ver solicitudes pendientes
# --------------------------------------------------------
class SolicitudesPendientesAdminView(generics.ListAPIView):
    serializer_class = SolicitudProfesionalAdminSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return SolicitudProfesional.objects.filter(estado="pendiente")


# --------------------------------------------------------
# 4️⃣ Admin - Aprobar o rechazar una solicitud
# --------------------------------------------------------
class GestionSolicitudProfesionalAdminView(generics.UpdateAPIView):
    queryset = SolicitudProfesional.objects.all()
    serializer_class = SolicitudProfesionalAdminSerializer
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class AdminDashboardView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    template_name = 'usuarios/admin.html'

    def test_func(self):
        return self.request.user.is_staff  # Solo admins pueden entrar