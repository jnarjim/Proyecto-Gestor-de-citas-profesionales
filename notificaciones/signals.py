from django.db.models.signals import post_save
from django.dispatch import receiver
from citas.models import Cita
from .models import Notificacion

@receiver(post_save, sender=Cita)
def gestionar_notificaciones_cita(sender, instance, created, **kwargs):

    cita = instance

    # Cuando se crea, nunca notificar
    if created:
        return

    # Obtener estado anterior desde BD
    try:
        old_instance = Cita.objects.get(pk=cita.pk)
        old_estado = old_instance.estado
    except Cita.DoesNotExist:
        old_estado = None

    # Si el estado no cambió → evitar duplicados
    if old_estado == cita.estado:
        return

    # RESERVA → notificación para PRO
    if cita.estado == "confirmada":
        Notificacion.objects.create(
            receptor=cita.profesional,
            emisor=cita.cliente,
            cita=cita,
            tipo="reserva",
            mensaje=f"{cita.cliente.first_name} ha reservado la cita del {cita.fecha} a las {cita.hora}.",
        )
        return

    # CANCELACIÓN → notificación para CLIENTE
    if cita.estado == "cancelada":
        Notificacion.objects.create(
            receptor=cita.cliente,
            emisor=cita.profesional,
            cita=cita,
            tipo="cancelacion",
            mensaje=f"Tu cita del {cita.fecha} a las {cita.hora} ha sido cancelada.",
        )
        return

    # COMPLETADA → notificación para CLIENTE
    if cita.estado == "completada":
        Notificacion.objects.create(
            receptor=cita.cliente,
            emisor=cita.profesional,
            cita=cita,
            tipo="completada",
            mensaje=f"Tu cita del {cita.fecha} a las {cita.hora} se ha marcado como completada.",
        )
        return