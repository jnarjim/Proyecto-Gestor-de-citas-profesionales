// detalle_cita.js
import { getProfile, refreshToken } from '/static/js/auth.js';

async function getCita(citaId, token) {
    const res = await fetch(`/api/citas/${citaId}/`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) return getCita(citaId, localStorage.getItem('access'));
        else return null;
    }

    if (!res.ok) {
        throw new Error('No se pudo obtener la cita');
    }

    return await res.json();
}

function mostrarDetalles(cita, perfil) {
    const detalleDiv = document.getElementById('detalle-cita');
    detalleDiv.innerHTML = `
        <p><strong>Profesional:</strong> ${cita.profesional.first_name} ${cita.profesional.last_name}</p>
        <p><strong>Cliente:</strong> ${cita.cliente ? cita.cliente.first_name + ' ' + cita.cliente.last_name : 'Libre'}</p>
        <p><strong>Fecha:</strong> ${cita.fecha}</p>
        <p><strong>Hora:</strong> ${cita.hora}</p>
        <p><strong>Estado:</strong> ${cita.estado}</p>
    `;

    // Mostrar botones según rol y estado
    const btnReservar = document.getElementById('btn-reservar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnCompletar = document.getElementById('btn-completar');

    btnReservar.classList.add('hidden');
    btnCancelar.classList.add('hidden');
    btnCompletar.classList.add('hidden');

    if (perfil.is_professional) {
        // Profesional
        if (cita.profesional.id === perfil.id) {
            if (cita.estado === 'pendiente' || cita.estado === 'confirmada') {
                btnCancelar.classList.remove('hidden');
            }
            if (cita.estado === 'confirmada') {
                btnCompletar.classList.remove('hidden');
            }
        }
    } else {
        // Cliente
        if (!cita.cliente && cita.estado === 'pendiente') {
            btnReservar.classList.remove('hidden');
        }
    }
}

async function reservarCita(citaId) {
    const token = localStorage.getItem('access');
    const res = await fetch(`/api/citas/${citaId}/reservar/`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await res.json();
    document.getElementById('cita-mensaje').innerText = data.detail || 'Acción completada';
    if (res.ok) location.reload();
}

async function cancelarCita(citaId) {
    const token = localStorage.getItem('access');
    const res = await fetch(`/api/citas/${citaId}/cancelar/`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await res.json();
    document.getElementById('cita-mensaje').innerText = data.detail || 'Acción completada';
    if (res.ok) location.reload();
}

async function completarCita(citaId) {
    const token = localStorage.getItem('access');
    const res = await fetch(`/api/citas/${citaId}/completar/`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await res.json();
    document.getElementById('cita-mensaje').innerText = data.detail || 'Acción completada';
    if (res.ok) location.reload();
}

async function init() {
    const perfil = await getProfile();
    if (!perfil) {
        window.location.href = '/login/';
        return;
    }

    // Obtener ID de la cita desde URL: /detalle-cita/<id>/
    const pathParts = window.location.pathname.split('/');
    const citaId = pathParts[pathParts.length - 2] || pathParts[pathParts.length - 1];

    try {
        const token = localStorage.getItem('access');
        const cita = await getCita(citaId, token);
        if (!cita) return;

        mostrarDetalles(cita, perfil);

        // Botones
        document.getElementById('btn-reservar').onclick = () => reservarCita(citaId);
        document.getElementById('btn-cancelar').onclick = () => cancelarCita(citaId);
        document.getElementById('btn-completar').onclick = () => completarCita(citaId);

    } catch (err) {
        console.error(err);
        document.getElementById('detalle-cita').innerText = 'Error al cargar la cita.';
    }
}

init();