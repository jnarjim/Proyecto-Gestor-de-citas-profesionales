// index.js
import { getProfile, refreshToken } from './auth.js';

async function cargarCitas() {
    const token = localStorage.getItem('access');
    if (!token) return;

    const res = await fetch('/api/citas/mis-citas/', {
        headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) return cargarCitas();
        else return;
    }

    const citas = await res.json();
    const ul = document.getElementById('citas-list');
    ul.innerHTML = '';

    const hoy = new Date().toISOString().split('T')[0];
    const proximas = citas.filter(c => c.fecha >= hoy).slice(0, 5);

    if (proximas.length === 0) {
        ul.innerHTML = '<li>No tienes próximas citas.</li>';
        return;
    }

    proximas.forEach(cita => {
        const li = document.createElement('li');
        li.textContent = `${cita.fecha} a las ${cita.hora} con ${cita.profesional ? cita.profesional.first_name : cita.cliente.first_name}`;
        ul.appendChild(li);
    });
}

async function init() {
    const perfil = await getProfile();
    if (!perfil) {
        window.location.href = '/login/';
        return;
    }

    document.getElementById('bienvenida').textContent = `Bienvenido, ${perfil.first_name}!`;
    cargarCitas();
}

init();