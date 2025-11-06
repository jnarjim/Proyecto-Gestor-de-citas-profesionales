from rest_framework import serializers
from .models import Cita
from usuarios.models import CustomUser

class ProfesionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'bio', 'phone']

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name']

class CitaSerializer(serializers.ModelSerializer):
    profesional = ProfesionalSerializer(read_only=True)
    cliente = ClienteSerializer(read_only=True)

    class Meta:
        model = Cita
        fields = [
            'id',
            'profesional',
            'cliente',
            'fecha',
            'hora',
            'duracion',
            'estado',
            'creada_en'
        ]

class CrearCitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = ['fecha', 'hora', 'duracion']
        # No pedimos 'profesional', se asignará automáticamente