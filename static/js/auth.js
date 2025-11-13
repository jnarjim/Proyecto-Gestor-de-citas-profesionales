// auth.js

export async function login(email, password) {
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
        throw new Error(data.detail || 'Error en login');
    }
}

export function logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = '/login/';
}

export async function getProfile() {
    const token = localStorage.getItem('access');
    if (!token) return null;

    const res = await fetch('/api/usuarios/me/', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) return null;
    return await res.json();
}

export async function refreshToken() {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) return false;

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
        logout();
        return false;
    }
}