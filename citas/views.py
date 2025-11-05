from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Cita
from .serializers import CitaSerializer


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