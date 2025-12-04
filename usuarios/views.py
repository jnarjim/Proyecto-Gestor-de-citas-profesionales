from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny

from .serializers import RegisterSerializer, UserSerializer, SolicitudProfesionalSerializer, SolicitudProfesionalAdminSerializer
from .token_serializers import MyTokenObtainPairSerializer
from .models import SolicitudProfesional
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin

class RegisterView(generics.CreateAPIView):
    """Vista para registro de nuevos usuarios"""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            # Formatear errores de forma más amigable
            errors = serializer.errors

            # Si hay error de email duplicado
            if 'email' in errors:
                return Response({
                    'email': 'Este correo ya está registrado.',
                    'message': 'Ya existe una cuenta con este email.'
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response({
            'message': 'Usuario registrado correctamente. Ya puedes iniciar sesión.',
            'user': serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers)

class LoginView(TokenObtainPairView):
    """Vista personalizada para login con mejor manejo de errores"""
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            # Error de credenciales incorrectas
            return Response({
                'detail': 'Email o contraseña incorrectos.',
                'message': 'Por favor, verifica tus credenciales.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

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