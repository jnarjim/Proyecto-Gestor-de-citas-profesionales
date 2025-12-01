from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Información extra en el token
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['is_professional'] = user.is_professional
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Información que llega al frontend en la respuesta JSON
        data['user'] = {
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_professional': self.user.is_professional,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
        }

        return data