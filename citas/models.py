from django.db import models
from django.conf import settings

class Cita(models.Model):
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('completada', 'Completada'),
    )

    profesional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='citas_profesional',
        db_index=True
    )

    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='citas_cliente',
        null=True,
        blank=True,
        db_index=True
    )

    fecha = models.DateField(db_index=True)
    hora = models.TimeField(db_index=True)
    duracion = models.IntegerField(default=30)  #minutos
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    creada_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cita con {self.profesional.email} el {self.fecha} a las {self.hora}"