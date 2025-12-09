from django.shortcuts import redirect
from django.urls import reverse
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class RoleBasedRedirectMiddleware:
    """
    Middleware que redirige automáticamente según el rol del usuario:
    - Admin a / → redirige a /admin-panel/
    - Cliente a /admin-panel/ → redirige a /
    """

    def __init__(self, get_response):
        self.get_response = get_response
        # Rutas que no deben ser redirigidas
        self.exempt_paths = [
            '/api/',
            '/admin/',
            '/static/',
            '/media/',
            '/login/',
            '/registro/',
        ]

    def __call__(self, request):
        # Obtener el path actual
        path = request.path

        # Si es una ruta exenta, no hacer nada
        if any(path.startswith(exempt_path) for exempt_path in self.exempt_paths):
            response = self.get_response(request)
            return response

        # Intentar obtener el token del usuario
        user_is_staff = self._get_user_staff_status(request)

        # Lógica de redirección
        if user_is_staff is not None:
            # Admin intenta ir a / (index de cliente)
            if user_is_staff and path == '/':
                return redirect('/admin-panel/')

            # Cliente intenta ir a /admin-panel/
            if not user_is_staff and path == '/admin-panel/':
                return redirect('/')

        response = self.get_response(request)
        return response

    def _get_user_staff_status(self, request):
        """
        Extrae el token JWT y determina si el usuario es staff
        Returns: True si es staff, False si no lo es, None si no hay token válido
        """
        # Intentar obtener el token de las cookies o headers
        token = None

        # 1. Intentar desde cookies
        if 'access' in request.COOKIES:
            token = request.COOKIES.get('access')

        # 2. Intentar desde Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        # Si no hay token, retornar None
        if not token:
            return None

        try:
            # Decodificar el token JWT
            access_token = AccessToken(token)
            return access_token.get('is_staff', False)
        except (InvalidToken, TokenError):
            return None