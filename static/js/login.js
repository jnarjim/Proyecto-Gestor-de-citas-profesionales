document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('login-form');
    if (!form) return; // seguridad: evita errores si otro html carga este js

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            email: form.email.value,
            password: form.password.value
        };

        try {
            const response = await fetch('/api/usuarios/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Guardar tokens JWT
                localStorage.setItem('access', result.access);
                localStorage.setItem('refresh', result.refresh);

                // Obtener información del usuario
                const perfilRes = await fetch('/api/usuarios/me/', {
                    headers: { 'Authorization': 'Bearer ' + result.access }
                });
                const perfil = await perfilRes.json();

                if (perfilRes.ok) {
                    localStorage.setItem('user_first_name', perfil.first_name);
                    localStorage.setItem('is_professional', perfil.is_professional);
                }

                // Redirigir
                window.location.href = '/';
            } else {
                document.getElementById('login-mensaje').innerText =
                    result.detail || 'Error en login';
            }
        } catch (err) {
            document.getElementById('login-mensaje').innerText = 'Error de conexión';
            console.error(err);
        }
    });
});