from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from .models import Cita
from .serializers import CitaSerializer, CrearCitaSerializer
from django.shortcuts import get_object_or_404
from datetime import date, datetime
from django.utils.dateparse import parse_time


class CitasDisponiblesProfesionalView(generics.ListAPIView):
    serializer_class = CitaSerializer

    def get_queryset(self):
        profesional_id = self.kwargs['profesional_id']
        queryset = Cita.objects.filter(profesional_id=profesional_id, cliente__isnull=True)

        # Filtrado opcional por rango de horas
        hora_inicio = self.request.query_params.get("hora_inicio")
        hora_fin = self.request.query_params.get("hora_fin")
        if hora_inicio and hora_fin:
            hora_inicio_obj = parse_time(hora_inicio)
            hora_fin_obj = parse_time(hora_fin)
            if hora_inicio_obj and hora_fin_obj:
                queryset = queryset.filter(hora__gte=hora_inicio_obj, hora__lte=hora_fin_obj)

        return queryset.order_by("fecha", "hora")


class MisCitasView(generics.ListAPIView):
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Base queryset según tipo de usuario
        if user.is_professional:
            queryset = Cita.objects.filter(profesional=user)
        else:
            queryset = Cita.objects.filter(cliente=user)

        # Filtrado opcional por uno o varios estados
        estado = self.request.query_params.get("estado")
        if estado:
            estados = [e.strip() for e in estado.split(",")]
            queryset = queryset.filter(estado__in=estados)

        # Filtrado opcional por rango de horas
        hora_inicio = self.request.query_params.get("hora_inicio")
        hora_fin = self.request.query_params.get("hora_fin")
        if hora_inicio and hora_fin:
            hora_inicio_obj = parse_time(hora_inicio)
            hora_fin_obj = parse_time(hora_fin)
            if hora_inicio_obj and hora_fin_obj:
                queryset = queryset.filter(hora__gte=hora_inicio_obj, hora__lte=hora_fin_obj)

        # Excluir horas pasadas si la fecha es hoy
        hoy = date.today()
        if queryset.exists():
            queryset = queryset.exclude(fecha=hoy, hora__lt=datetime.now().time())

        return queryset.order_by("fecha", "hora")

class CrearCitaView(generics.CreateAPIView):
    serializer_class = CrearCitaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        # Solo profesionales
        if not user.is_professional:
            raise permissions.PermissionDenied("Solo los profesionales pueden crear citas")

        fecha = serializer.validated_data['fecha']
        hora = serializer.validated_data['hora']

        # No crear citas en fechas pasadas
        if fecha < date.today():
            raise ValidationError("No puedes crear una cita en una fecha pasada.")

        # Si se crea el mismo dia no se permite en horas pasadas
        if fecha == date.today() and hora < datetime.now().time():
            raise ValidationError("No puedes crear una cita en una hora pasada.")

        # Evitar choques de horarios
        choque = Cita.objects.filter(
            profesional=user,
            fecha=fecha,
            hora=hora,
            estado__in=["pendiente", "confirmada"]  # si está cancelada, no afecta
        ).exists()

        if choque:
            raise ValidationError(
                "Ya existe una cita en esa fecha y hora."
            )

        # Crear la cita
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

        # Validar que la cita no sea de una fecha pasada
        if cita.fecha < date.today():
            return Response(
                {"detail": "No puedes reservar una cita en una fecha pasada."},
                status=status.HTTP_400_BAD_REQUEST
            )

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

        #  No permitir cancelar citas pasadas
        if cita.fecha < date.today():
            return Response(
                {"detail": "No puedes cancelar una cita en una fecha pasada."},
                status=status.HTTP_400_BAD_REQUEST
            )

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

class CompletarCitaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, cita_id):
        user = request.user

        # Solo profesionales pueden completar citas
        if not user.is_professional:
            return Response(
                {"detail": "Solo los profesionales pueden completar citas."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Obtener la cita
        cita = get_object_or_404(Cita, id=cita_id)

        # No permitir completar citas pasadas que no estén confirmadas
        if cita.fecha < date.today() and cita.estado != "confirmada":
            return Response(
                {"detail": "No puedes completar una cita pasada que no estuvo confirmada."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Solo puede completar sus propias citas
        if cita.profesional != user:
            return Response(
                {"detail": "No puedes completar citas que no son tuyas."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Solo citas confirmadas pueden ser completadas
        if cita.estado != "confirmada":
            return Response(
                {"detail": "Solo puedes completar citas que están confirmadas."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Completar la cita
        cita.estado = "completada"
        cita.save()

        return Response(
            {"detail": "Cita marcada como completada."},
            status=status.HTTP_200_OK
        )

from django.utils.dateparse import parse_date

class CitasDisponiblesGlobalView(generics.ListAPIView):
    serializer_class = CitaSerializer

    def get_queryset(self):
        queryset = Cita.objects.filter(cliente__isnull=True)

        # Filtrado por estados opcional
        estados = self.request.query_params.get("estado")
        if estados:
            estados_list = [e.strip() for e in estados.split(",")]
            queryset = queryset.filter(estado__in=estados_list)
        else:
            # Por defecto, solo pendientes
            queryset = queryset.filter(estado="pendiente")

        # Filtrado por fecha
        fecha = self.request.query_params.get("fecha")
        fecha_inicio = self.request.query_params.get("fecha_inicio")
        fecha_fin = self.request.query_params.get("fecha_fin")

        if fecha:
            fecha_obj = parse_date(fecha)
            if fecha_obj:
                queryset = queryset.filter(fecha=fecha_obj)

        if fecha_inicio and fecha_fin:
            fecha_inicio_obj = parse_date(fecha_inicio)
            fecha_fin_obj = parse_date(fecha_fin)
            if fecha_inicio_obj and fecha_fin_obj:
                queryset = queryset.filter(fecha__range=(fecha_inicio_obj, fecha_fin_obj))

        # Filtrado por hora
        hora_inicio = self.request.query_params.get("hora_inicio")
        hora_fin = self.request.query_params.get("hora_fin")
        if hora_inicio and hora_fin:
            hora_inicio_obj = parse_time(hora_inicio)
            hora_fin_obj = parse_time(hora_fin)
            if hora_inicio_obj and hora_fin_obj:
                queryset = queryset.filter(hora__gte=hora_inicio_obj, hora__lte=hora_fin_obj)

        # Filtrado por profesional
        profesional_id = self.request.query_params.get("profesional_id")
        if profesional_id:
            queryset = queryset.filter(profesional_id=profesional_id)

        # Excluir horas pasadas si la fecha es hoy
        hoy = date.today()
        queryset = queryset.exclude(fecha=hoy, hora__lt=datetime.now().time())

        return queryset.order_by("fecha", "hora")