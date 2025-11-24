from django.db.models.signals import post_save
from django.dispatch import receiver
from citas.models import Cita
from .models import Notificacion

@receiver(post_save, sender=Cita)
def gestionar_notificaciones_cita(sender, instance, created, **kwargs):

    cita = instance

    if created:
        return  # cuando el profesional crea disponibilidad, no notificar

    # Cliente reserva la cita → PROFESIONAL recibe notificación
    if cita.estado == "confirmada":
        Notificacion.objects.create(
            receptor=cita.profesional,
            emisor=cita.cliente,
            cita=cita,
            tipo="reserva",
            mensaje=f"{cita.cliente.first_name} ha reservado la cita del {cita.fecha} a las {cita.hora}.",
        )
        return

    # Se cancela → cliente recibe notificación
    if cita.estado == "cancelada":
        Notificacion.objects.create(
            receptor=cita.cliente,
            emisor=cita.profesional,
            cita=cita,
            tipo="cancelacion",
            mensaje=f"Tu cita del {cita.fecha} a las {cita.hora} ha sido cancelada.",
        )
        return

    # Se completa
    if cita.estado == "completada":
        Notificacion.objects.create(
            receptor=cita.cliente,
            emisor=cita.profesional,
            cita=cita,
            tipo="completada",
            mensaje=f"Tu cita del {cita.fecha} a las {cita.hora} se ha marcado como completada.",
        )
        return