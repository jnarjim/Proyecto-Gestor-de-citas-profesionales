// citas.js
import { getProfile, refreshToken } from './auth.js';

async function cargarMisCitas() {
    const token = localStorage.getItem('access');
    if (!token) return;

    const res = await fetch('/api/citas/mis-citas/', {
        headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) return cargarMisCitas();
        else return;
    }

    const citas = await res.json();
    const ul = document.getElementById('mis-citas-list');
    ul.innerHTML = '';

    if (citas.length === 0) {
        ul.innerHTML = '<li>No tienes citas.</li>';
        return;
    }

    citas.forEach(cita => {
        const li = document.createElement('li');
        li.textContent = `${cita.fecha} a las ${cita.hora} con ${cita.profesional ? cita.profesional.first_name : cita.cliente.first_name} - Estado: ${cita.estado}`;
        ul.appendChild(li);
    });
}

async function init() {
    const perfil = await getProfile();
    if (!perfil) {
        window.location.href = '/login/';
        return;
    }

    cargarMisCitas();
}

init();