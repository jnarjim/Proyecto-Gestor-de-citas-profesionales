
/**
 * Mostrar toast global
 * @param {string} message
 * @param {string} type - 'success', 'error', 'info', 'warning'
 */
window.showToast = function(message, type = 'success') {
    window.dispatchEvent(new CustomEvent('toast', { detail: { message, type } }));
}

/**
 * Login de usuario
 * @param {string} email
 * @param {string} password
 */
window.login = async function(email, password) {
    try {
        const res = await fetch('/api/usuarios/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            // Guardar tokens
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);

            // Guardar datos del usuario desde la respuesta del login
            if (data.user) {
                localStorage.setItem('user_first_name', data.user.first_name);
                localStorage.setItem('is_professional', data.user.is_professional);
                localStorage.setItem('is_staff', data.user.is_staff);
            }

            // Obtener perfil completo del usuario
            const perfil = await window.getProfile();

            showToast('Login correcto', 'success');

            // Redirigir según el rol
            if (data.user.is_staff) {
                window.location.href = '/admin-panel/';
            } else {
                window.location.href = '/';
            }
        } else {
            showToast(data.detail || 'Error en login', 'error');
        }

    } catch (err) {
        console.error('Error en login:', err);
        showToast('Error de conexión', 'error');
    }
}

/**
 * Logout de usuario
 */
window.logout = function() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user_first_name');
    localStorage.removeItem('is_professional');
    localStorage.removeItem('is_staff');
    showToast('Sesión cerrada', 'info');
    window.location.href = '/login/';
}

/**
 * Obtener perfil del usuario logueado
 * @returns {object|null} Perfil o null
 */
window.getProfile = async function() {
    const token = localStorage.getItem('access');
    if (!token) return null;

    try {
        const res = await fetch('/api/usuarios/me/', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!res.ok) {
            // Si el token expiró, intentar refrescar
            if (res.status === 401) {
                const refreshed = await window.refreshToken();
                if (refreshed) {
                    // Reintentar con el nuevo token
                    return window.getProfile();
                }
            }
            return null;
        }

        const perfil = await res.json();

        // Guardar datos importantes en localStorage
        localStorage.setItem('user_first_name', perfil.first_name);
        localStorage.setItem('is_professional', perfil.is_professional);
        localStorage.setItem('is_staff', perfil.is_staff || false);

        return perfil;

    } catch (err) {
        console.error('Error al obtener perfil:', err);
        return null;
    }
}

/**
 * Refrescar token de acceso usando refresh token
 * @returns {boolean} true si se refrescó, false si falló
 */
window.refreshToken = async function() {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) return false;

    try {
        const res = await fetch('/api/usuarios/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('access', data.access);
            return true;
        } else {
            showToast('Sesión expirada', 'warning');
            window.logout();
            return false;
        }

    } catch (err) {
        console.error('Error al refrescar token:', err);
        showToast('Error de conexión', 'error');
        window.logout();
        return false;
    }
}

/**
 * Verificar si el usuario es admin
 * @returns {boolean} true si es admin, false si no
 */
window.isAdmin = function() {
    const token = localStorage.getItem('access');
    if (!token) return false;

    try {
        // Decodificar JWT
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.is_staff === true || payload.is_superuser === true;
    } catch (error) {
        console.error('Error verificando admin:', error);
        return false;
    }
}

/**
 * Verificar si el usuario es profesional
 * @returns {boolean} true si es profesional, false si no
 */
window.isProfessional = function() {
    const token = localStorage.getItem('access');
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.is_professional === true;
    } catch (error) {
        console.error('Error verificando profesional:', error);
        return false;
    }
}

/**
 * Obtener el usuario del token JWT sin hacer petición
 * @returns {Object|null} Datos básicos del usuario o null
 */
window.getUserFromToken = function() {
    const token = localStorage.getItem('access');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            email: payload.email,
            first_name: payload.first_name,
            is_professional: payload.is_professional || false,
            is_staff: payload.is_staff || false,
            is_superuser: payload.is_superuser || false,
        };
    } catch (error) {
        console.error('Error decodificando token:', error);
        return null;
    }
}

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean}
 */
window.isAuthenticated = function() {
    return !!localStorage.getItem('access');
}