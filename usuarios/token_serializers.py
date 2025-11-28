from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Información extra que quieres agregar al token
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name  # opcional
        token['is_professional'] = user.is_professional
        token['is_staff'] = user.is_staff  # ✅ detectar admin

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Añadir info extra al payload que llega al frontend
        data['user'] = {
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_professional': self.user.is_professional,
            'is_staff': self.user.is_staff,
        }
        return data