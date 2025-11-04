from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import CustomUserManager

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField('email', unique=True)
    first_name = models.CharField('nombre', max_length=150)
    last_name = models.CharField('apellidos', max_length=150)
    phone = models.CharField('teléfono', max_length=20, blank=True, null=True)
    bio = models.TextField('biografía', blank=True)
    is_professional = models.BooleanField('es profesional', default=False)
    is_staff = models.BooleanField('staff', default=False)
    is_active = models.BooleanField('activo', default=True)
    date_joined = models.DateTimeField('fecha de registro', auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.email} - {self.first_name} {self.last_name}"