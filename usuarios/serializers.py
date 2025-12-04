from rest_framework import serializers
from .models import CustomUser, SolicitudProfesional

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            "min_length": "La contraseña debe tener al menos 6 caracteres."
        }
    )

    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'phone', 'bio', 'password']

    # Validación específica para email
    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    # Validación general
    def validate(self, data):
        if not data.get("first_name") or data["first_name"].strip() == "":
            raise serializers.ValidationError({"first_name": "El nombre no puede estar vacío."})

        if not data.get("last_name") or data["last_name"].strip() == "":
            raise serializers.ValidationError({"last_name": "Los apellidos no pueden estar vacíos."})

        return data

    # Crear usuario
    def create(self, validated_data):
        return CustomUser.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', '').strip(),
            last_name=validated_data.get('last_name', '').strip(),
            phone=validated_data.get('phone', ''),
            bio=validated_data.get('bio', ''),
            password=validated_data['password']
        )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'phone',
            'bio',
            'is_professional',
            'date_joined'
        ]


class SolicitudProfesionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolicitudProfesional
        fields = ['id', 'acepta_reapertura_citas', 'estado', 'creada_en']
        read_only_fields = ['estado', 'creada_en']

    def validate(self, data):
        usuario = self.context['request'].user

        if usuario.is_professional:
            raise serializers.ValidationError("Ya eres profesional.")

        if SolicitudProfesional.objects.filter(usuario=usuario, estado="pendiente").exists():
            raise serializers.ValidationError("Ya tienes una solicitud pendiente.")

        return data

    def create(self, validated_data):
        # Aseguramos que 'usuario' nunca venga en validated_data
        validated_data.pop('usuario', None)
        return SolicitudProfesional.objects.create(
            usuario=self.context['request'].user,
            **validated_data
        )


class SolicitudProfesionalAdminSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)

    class Meta:
        model = SolicitudProfesional
        fields = ['id', 'usuario', 'acepta_reapertura_citas', 'estado', 'creada_en']
        read_only_fields = ['usuario', 'acepta_reapertura_citas', 'creada_en']

    def update(self, instance, validated_data):
        nuevo_estado = validated_data.get('estado')

        if nuevo_estado not in ['aprobada', 'rechazada']:
            raise serializers.ValidationError("Estado no válido.")

        instance.estado = nuevo_estado
        instance.save()

        if nuevo_estado == 'aprobada':
            usuario = instance.usuario
            usuario.is_professional = True
            usuario.permite_reabrir_citas = instance.acepta_reapertura_citas
            usuario.save()

        return instance