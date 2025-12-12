from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from citas.models import Cita
from .models import Notificacion
from .helpers import enviar_notificacion_email

# Guardar el estado anterior ANTES del save
@receiver(pre_save, sender=Cita)
def guardar_estado_anterior(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = Cita.objects.get(pk=instance.pk)
            instance._old_estado = old.estado
        except Cita.DoesNotExist:
            instance._old_estado = None
    else:
        instance._old_estado = None


@receiver(post_save, sender=Cita)
def gestionar_notificaciones_cita(sender, instance, created, **kwargs):

    cita = instance

    # NO notificar cuando se crea disponibilidad
    if created:
        return

    # Obtener estado anterior guardado en pre_save
    old_estado = getattr(instance, "_old_estado", None)

    # Si no cambió el estado → evitar duplicados
    if old_estado == cita.estado:
        return

    # ------------------------
    #   CAMBIO A CONFIRMADA
    # ------------------------
    if cita.estado == "confirmada":
        # Notificación al profesional
        Notificacion.objects.create(
            receptor=cita.profesional,
            emisor=cita.cliente,
            cita=cita,
            tipo="reserva",
            mensaje=f"{cita.cliente.first_name} ha reservado la cita del {cita.fecha} a las {cita.hora}.",
        )

        # Notificación al cliente
        Notificacion.objects.create(
            receptor=cita.cliente,
            emisor=cita.profesional,
            cita=cita,
            tipo="reserva",
            mensaje=f"Has reservado la cita con {cita.profesional.first_name} el {cita.fecha} a las {cita.hora}.",
        )

        enviar_notificacion_email(
            usuario=cita.profesional,
            asunto="Nueva reserva confirmada",
            mensaje=f"{cita.cliente.first_name} ha reservado una cita el {cita.fecha} a las {cita.hora}."
        )

        return

    # ------------------------
    #   CAMBIO A CANCELADA
    # ------------------------
    if cita.estado == "cancelada":
        Notificacion.objects.create(
            receptor=cita.cliente,
            emisor=cita.profesional,
            cita=cita,
            tipo="cancelacion",
            mensaje=f"Tu cita del {cita.fecha} a las {cita.hora} ha sido cancelada.",
        )

        enviar_notificacion_email(
            usuario=cita.cliente,
            asunto="Cita cancelada",
            mensaje=f"Tu cita del {cita.fecha} a las {cita.hora} ha sido cancelada por el profesional."
        )
        return

    # ------------------------
    #   CAMBIO A COMPLETADA
    # ------------------------
    if cita.estado == "completada":
        Notificacion.objects.create(
            receptor=cita.cliente,
            emisor=cita.profesional,
            cita=cita,
            tipo="completada",
            mensaje=f"Tu cita del {cita.fecha} a las {cita.hora} se ha marcado como completada.",
        )

        enviar_notificacion_email(
            usuario=cita.cliente,
            asunto="Cita completada",
            mensaje=f"Tu cita del {cita.fecha} a las {cita.hora} ha sido marcada como completada."
        )
        return