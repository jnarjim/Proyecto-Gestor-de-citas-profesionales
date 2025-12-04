document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registro-form");
    if (!form) return;

    const firstNameInput = form.first_name;
    const lastNameInput = form.last_name;
    const emailInput = form.email;
    const passwordInput = form.password;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Función para mostrar error en un campo específico
    function mostrarErrorCampo(input, mensaje) {
        const errorPrevio = input.parentElement.querySelector('.error-message');
        if (errorPrevio) errorPrevio.remove();

        input.classList.add('border-red-500', 'focus:ring-red-500');
        input.classList.remove('border-gray-300', 'focus:ring-green-500');

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
        input.classList.add('border-gray-300', 'focus:ring-green-500');
    }

    // Función para mostrar éxito en un campo
    function mostrarExitoCampo(input) {
        limpiarErrorCampo(input);
        input.classList.add('border-green-500');
    }

    // Limpiar errores al escribir
    [firstNameInput, lastNameInput, emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => limpiarErrorCampo(input));
    });

    // Validación en tiempo real del email
    emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            mostrarExitoCampo(emailInput);
        }
    });

    // Validación en tiempo real de la contraseña
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const hint = passwordInput.parentElement.querySelector('.password-hint');

        if (!hint) {
            const hintDiv = document.createElement('p');
            hintDiv.className = 'password-hint text-xs mt-1 text-gray-500';
            passwordInput.parentElement.appendChild(hintDiv);
        }

        const hintElement = passwordInput.parentElement.querySelector('.password-hint');

        if (password.length === 0) {
            hintElement.textContent = '';
        } else if (password.length < 6) {
            hintElement.className = 'password-hint text-xs mt-1 text-yellow-600';
            hintElement.textContent = `Faltan ${6 - password.length} caracteres`;
        } else {
            hintElement.className = 'password-hint text-xs mt-1 text-green-600';
            hintElement.textContent = '✓ Contraseña válida';
            mostrarExitoCampo(passwordInput);
        }
    });

    // Validación del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Limpiar errores previos
        [firstNameInput, lastNameInput, emailInput, passwordInput].forEach(limpiarErrorCampo);

        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validaciones del frontend
        let hayErrores = false;

        if (!firstName) {
            mostrarErrorCampo(firstNameInput, 'El nombre es obligatorio');
            hayErrores = true;
        } else if (firstName.length < 2) {
            mostrarErrorCampo(firstNameInput, 'El nombre debe tener al menos 2 caracteres');
            hayErrores = true;
        } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(firstName)) {
            mostrarErrorCampo(firstNameInput, 'El nombre solo puede contener letras');
            hayErrores = true;
        }

        if (!lastName) {
            mostrarErrorCampo(lastNameInput, 'Los apellidos son obligatorios');
            hayErrores = true;
        } else if (lastName.length < 2) {
            mostrarErrorCampo(lastNameInput, 'Los apellidos deben tener al menos 2 caracteres');
            hayErrores = true;
        } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(lastName)) {
            mostrarErrorCampo(lastNameInput, 'Los apellidos solo pueden contener letras');
            hayErrores = true;
        }

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
            Creando cuenta...
        `;

        try {
            const res = await fetch("/api/usuarios/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password: password,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(result.message || "¡Cuenta creada exitosamente!");

                // Mostrar mensaje adicional
                submitBtn.innerHTML = `
                    <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    ¡Cuenta creada!
                `;
                submitBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                submitBtn.classList.add('bg-green-700');

                setTimeout(() => {
                    window.location.href = "/login/";
                }, 1500);
            } else {
                // Manejar errores específicos del backend
                submitBtn.disabled = false;
                submitBtn.innerHTML = textoOriginal;

                if (res.status === 400) {
                    // Errores específicos de campos
                    if (result.email) {
                        const errorMsg = Array.isArray(result.email) ? result.email[0] : result.email;
                        mostrarErrorCampo(emailInput, errorMsg);

                        if (errorMsg.includes('ya está registrado') || errorMsg.includes('already exists')) {
                            toast.error('Este email ya está registrado. ¿Quieres iniciar sesión?');
                        }
                    }

                    if (result.first_name) {
                        mostrarErrorCampo(firstNameInput, Array.isArray(result.first_name) ? result.first_name[0] : result.first_name);
                    }

                    if (result.last_name) {
                        mostrarErrorCampo(lastNameInput, Array.isArray(result.last_name) ? result.last_name[0] : result.last_name);
                    }

                    if (result.password) {
                        mostrarErrorCampo(passwordInput, Array.isArray(result.password) ? result.password[0] : result.password);
                    }

                    // Errores generales
                    if (result.detail) {
                        toast.error(result.detail);
                    } else if (result.non_field_errors) {
                        toast.error(Array.isArray(result.non_field_errors) ? result.non_field_errors[0] : result.non_field_errors);
                    } else if (!result.email && !result.first_name && !result.last_name && !result.password) {
                        toast.error(result.message || 'Error en el registro. Verifica los datos.');
                    }
                } else if (res.status >= 500) {
                    toast.error('Error del servidor. Intenta de nuevo más tarde.');
                } else {
                    toast.error(result.message || result.detail || "Error al registrar usuario");
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