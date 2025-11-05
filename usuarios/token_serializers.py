from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Información extra que quieres agregar al token
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['is_professional'] = user.is_professional

        return token