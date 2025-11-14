// auth.js

window.login = async function(email, password) {
    try {
        const res = await fetch('/api/usuarios/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            window.location.href = '/';
        } else {
            alert(data.detail || 'Error en login');
        }
    } catch (err) {
        console.error('Error en login:', err);
        alert('Error de conexión');
    }
}

window.logout = function() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user_first_name');
    localStorage.removeItem('is_professional');
    window.location.href = '/login/';
}

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
            window.logout();
            return false;
        }
    } catch (err) {
        console.error('Error al refrescar token:', err);
        window.logout();
        return false;
    }
}