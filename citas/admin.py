from django.contrib import admin
from .models import Cita

@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ('id', 'profesional', 'cliente', 'fecha', 'hora', 'estado')
    list_filter = ('fecha', 'estado', 'profesional')
    search_fields = ('profesional__email', 'cliente__email')