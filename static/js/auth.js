// auth.js - Remasterizado con toasts

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

            // Obtener perfil del usuario
            const perfil = await window.getProfile();
            if (perfil) {
                localStorage.setItem('user_first_name', perfil.first_name);
                localStorage.setItem('is_professional', perfil.is_professional);
            }

            showToast('Login correcto', 'success');
            window.location.href = '/';
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

        if (!res.ok) return null;
        return await res.json();
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