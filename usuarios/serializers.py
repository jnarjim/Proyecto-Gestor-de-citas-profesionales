from rest_framework import serializers
from .models import CustomUser, SolicitudProfesional

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'phone', 'bio', 'password']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            bio=validated_data.get('bio', ''),
            password=validated_data['password']
        )
        return user


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