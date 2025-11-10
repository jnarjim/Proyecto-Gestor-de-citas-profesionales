from rest_framework import serializers
from .models import Notificacion

class NotificacionSerializer(serializers.ModelSerializer):
    receptor_nombre = serializers.CharField(source='receptor.username', read_only=True)
    cita_id = serializers.IntegerField(source='cita.id', read_only=True)

    class Meta:
        model = Notificacion
        fields = [
            "id",
            "receptor",
            "receptor_nombre",
            "cita_id",
            "tipo",
            "mensaje",
            "leido",
            "creada_en"
        ]