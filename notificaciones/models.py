from django.db import models
from django.conf import settings
from citas.models import Cita

class Notificacion(models.Model):
    receptor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notificaciones"
    )
    cita = models.ForeignKey(
        Cita,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notificaciones"
    )
    tipo = models.CharField(
        max_length=50,
        choices=[
            ("reserva", "Cita reservada"),
            ("cancelacion", "Cita cancelada"),
            ("completada", "Cita completada"),
            ("recordatorio", "Recordatorio de cita"),
        ]
    )
    mensaje = models.TextField()
    leido = models.BooleanField(default=False)
    creada_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notificación para {self.receptor} - {self.tipo}"