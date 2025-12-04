document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    if (!form) return;

    const emailInput = form.email;
    const passwordInput = form.password;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Función para mostrar error en un campo específico
    function mostrarErrorCampo(input, mensaje) {
        // Remover error previo si existe
        const errorPrevio = input.parentElement.querySelector('.error-message');
        if (errorPrevio) errorPrevio.remove();

        // Añadir borde rojo
        input.classList.add('border-red-500', 'focus:ring-red-500');
        input.classList.remove('border-gray-300', 'focus:ring-blue-500');

        // Crear mensaje de error
        const errorDiv = document.createElement('p');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1';
        errorDiv.textContent = mensaje;
        input.parentElement.appendChild(errorDiv);
    }

    // Función para limpiar errores de un campo
    function limpiarErrorCampo(input) {
        const errorPrevio = input.parentElement.querySelector('.error-message');
        if (errorPrevio) errorPrevio.remove();

        input.classList.remove('border-red-500', 'focus:ring-red-500');
        input.classList.add('border-gray-300', 'focus:ring-blue-500');
    }

    // Limpiar errores al escribir
    emailInput.addEventListener('input', () => limpiarErrorCampo(emailInput));
    passwordInput.addEventListener('input', () => limpiarErrorCampo(passwordInput));

    // Validación del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Limpiar errores previos
        limpiarErrorCampo(emailInput);
        limpiarErrorCampo(passwordInput);

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validaciones del frontend
        let hayErrores = false;

        if (!email) {
            mostrarErrorCampo(emailInput, 'El email es obligatorio');
            hayErrores = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            mostrarErrorCampo(emailInput, 'El formato del email no es válido');
            hayErrores = true;
        }

        if (!password) {
            mostrarErrorCampo(passwordInput, 'La contraseña es obligatoria');
            hayErrores = true;
        } else if (password.length < 6) {
            mostrarErrorCampo(passwordInput, 'La contraseña debe tener al menos 6 caracteres');
            hayErrores = true;
        }

        if (hayErrores) {
            toast.error('Por favor, corrige los errores en el formulario');
            return;
        }

        // Deshabilitar botón durante la petición
        submitBtn.disabled = true;
        const textoOriginal = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <svg class="animate-spin h-5 w-5 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Iniciando sesión...
        `;

        try {
            const res = await fetch("/api/usuarios/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await res.json();

            if (res.ok) {
                // Guardar tokens
                localStorage.setItem("access", result.access);
                localStorage.setItem("refresh", result.refresh);

                // Obtener perfil
                const perfilRes = await fetch("/api/usuarios/me/", {
                    headers: { "Authorization": "Bearer " + result.access },
                });

                const perfil = await perfilRes.json();
                if (perfilRes.ok) {
                    localStorage.setItem("user_first_name", perfil.first_name);
                    localStorage.setItem("is_professional", perfil.is_professional);
                }

                toast.success(`¡Bienvenido, ${perfil.first_name}!`);

                // Evaluar tipo de usuario
                const payload = JSON.parse(atob(result.access.split(".")[1]));

                if (payload.is_staff || payload.is_superuser) {
                    setTimeout(() => (window.location.href = "/usuarios/admin/dashboard/"), 1200);
                    return;
                }

                setTimeout(() => (window.location.href = "/"), 1200);
            } else {
                // Manejar errores específicos del backend
                submitBtn.disabled = false;
                submitBtn.innerHTML = textoOriginal;

                // Errores comunes
                if (res.status === 401) {
                    mostrarErrorCampo(emailInput, 'Email o contraseña incorrectos');
                    mostrarErrorCampo(passwordInput, 'Email o contraseña incorrectos');
                    toast.error('Credenciales incorrectas');
                } else if (res.status === 400) {
                    // Errores específicos de campos
                    if (result.email) {
                        mostrarErrorCampo(emailInput, Array.isArray(result.email) ? result.email[0] : result.email);
                    }
                    if (result.password) {
                        mostrarErrorCampo(passwordInput, Array.isArray(result.password) ? result.password[0] : result.password);
                    }
                    if (result.detail) {
                        toast.error(result.detail);
                    } else if (result.non_field_errors) {
                        toast.error(Array.isArray(result.non_field_errors) ? result.non_field_errors[0] : result.non_field_errors);
                    } else {
                        toast.error('Datos inválidos. Revisa los campos.');
                    }
                } else if (res.status === 403) {
                    toast.error('Acceso denegado. Tu cuenta puede estar inactiva.');
                } else if (res.status >= 500) {
                    toast.error('Error del servidor. Intenta de nuevo más tarde.');
                } else {
                    toast.error(result.detail || result.message || "Error al iniciar sesión");
                }
            }
        } catch (err) {
            console.error(err);
            submitBtn.disabled = false;
            submitBtn.innerHTML = textoOriginal;
            toast.error("Error de conexión. Verifica tu internet.");
        }
    });
});