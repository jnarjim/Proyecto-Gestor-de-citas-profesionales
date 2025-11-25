from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Notificacion
from .serializers import NotificacionSerializer

class ListNotificacionesView(generics.ListAPIView):
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notificacion.objects.filter(receptor=user).order_by("-creada_en")


class DetalleNotificacionView(generics.RetrieveAPIView):
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Notificacion.objects.all()


class MarcarNotificacionLeidaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notificacion = get_object_or_404(Notificacion, id=pk, receptor=request.user)
        notificacion.leido = True
        notificacion.save()
        return Response({"detail": "Notificación marcada como leída."})

class EliminarNotificacionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        notificacion = get_object_or_404(Notificacion, id=pk, receptor=request.user)
        notificacion.delete()
        return Response({"detail": "Notificación eliminada correctamente."}, status=204)