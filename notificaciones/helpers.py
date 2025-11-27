from django.core.mail import send_mail
from django.conf import settings

def enviar_notificacion_email(usuario, asunto, mensaje):
    """
    Envía un correo si está habilitado en settings.
    """
    if not getattr(settings, "EMAIL_NOTIFICATIONS_ENABLED", True):
        return

    if not usuario.email:
        return

    send_mail(
        subject=asunto,
        message=mensaje,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[usuario.email],
        fail_silently=True
    )