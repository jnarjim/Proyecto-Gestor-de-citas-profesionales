from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cita
from .serializers import CitaSerializer, CrearCitaSerializer
from django.shortcuts import get_object_or_404


class CitasDisponiblesProfesionalView(generics.ListAPIView):
    serializer_class = CitaSerializer

    def get_queryset(self):
        profesional_id = self.kwargs['profesional_id']
        return Cita.objects.filter(profesional_id=profesional_id, cliente__isnull=True)


class MisCitasView(generics.ListAPIView):
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_professional:
            return Cita.objects.filter(profesional=user)
        else:
            return Cita.objects.filter(cliente=user)

class CrearCitaView(generics.CreateAPIView):
    serializer_class = CrearCitaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_professional:
            raise permissions.PermissionDenied("Solo los profesionales pueden crear citas")
        serializer.save(profesional=user)

class ReservarCitaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, cita_id):
        user = request.user

        # Solo clientes pueden reservar
        if user.is_professional:
            return Response({"detail": "Los profesionales no pueden reservar citas."},
                            status=status.HTTP_403_FORBIDDEN)

        # Obtener la cita
        cita = get_object_or_404(Cita, id=cita_id)

        # Verificar si ya está reservada
        if cita.cliente is not None:
            return Response({"detail": "La cita ya está reservada."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Asignar cliente y confirmar cita
        cita.cliente = user
        cita.estado = "confirmada"
        cita.save()

        return Response({"detail": "Cita reservada correctamente"}, status=status.HTTP_200_OK)

class CancelarCitaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, cita_id):
        user = request.user
        cita = get_object_or_404(Cita, id=cita_id)

        # CASO 1: Cliente cancela su propia cita
        if not user.is_professional:

            # El cliente solo puede cancelar citas suyas
            if cita.cliente != user:
                return Response(
                    {"detail": "No puedes cancelar una cita que no es tuya."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Si el profesional PERMITE reabrir citas → queda libre
            if cita.profesional.permite_reabrir_citas:
                cita.cliente = None
                cita.estado = "pendiente"

            # Si NO permite reabrir → pasa a cancelada y NO queda libre
            else:
                cita.estado = "cancelada"

            cita.save()

            return Response(
                {"detail": "Has cancelado tu cita correctamente."},
                status=status.HTTP_200_OK
            )

        # CASO 2: Profesional cancela una cita suya
        else:

            # Un profesional no puede cancelar citas de otro profesional
            if cita.profesional != user:
                return Response(
                    {"detail": "No puedes cancelar una cita de otro profesional."},
                    status=status.HTTP_403_FORBIDDEN
                )

            cita.estado = "cancelada"
            cita.save()

            return Response(
                {"detail": "Has cancelado la cita de tu agenda."},
                status=status.HTTP_200_OK
            )