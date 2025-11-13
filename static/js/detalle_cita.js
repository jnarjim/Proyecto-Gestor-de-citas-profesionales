// detalle_cita.js

const citaId = window.location.pathname.split('/').filter(Boolean).pop(); // Obtiene el id de la URL
const token = localStorage.getItem('access');

if (!token) {
    document.getElementById('cita-mensaje').innerText = 'Debes iniciar sesión';
}

// Función para cargar detalles de la cita
async function cargarDetalleCita() {
    try {
        const response = await fetch(`/api/citas/${citaId}/`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) throw new Error('Error al cargar cita');

        const cita = await response.json();
        const div = document.getElementById('detalle-cita');
        div.innerHTML = `
            <p><strong>Fecha:</strong> ${cita.fecha}</p>
            <p><strong>Hora:</strong> ${cita.hora}</p>
            <p><strong>Profesional:</strong> ${cita.profesional.first_name} ${cita.profesional.last_name}</p>
            <p><strong>Cliente:</strong> ${cita.cliente ? cita.cliente.first_name + ' ' + cita.cliente.last_name : 'No asignado'}</p>
            <p><strong>Estado:</strong> ${cita.estado}</p>
        `;

        // Mostrar botones según estado y rol
        const btnReservar = document.getElementById('btn-reservar');
        const btnCancelar = document.getElementById('btn-cancelar');
        const btnCompletar = document.getElementById('btn-completar');

        if (cita.estado === 'pendiente' && !cita.cliente) btnReservar.classList.remove('hidden');
        if (cita.estado !== 'completada') btnCancelar.classList.remove('hidden');
        if (cita.estado === 'confirmada' && cita.profesional.id === cita.usuario_id) btnCompletar.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        document.getElementById('cita-mensaje').innerText = 'Error cargando la cita';
    }
}

// Función para reservar cita
async function reservarCita() {
    try {
        const response = await fetch(`/api/citas/${citaId}/reservar/`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            const res = await response.json();
            alert(res.detail || 'Error al reservar cita');
            return;
        }

        alert('Cita reservada correctamente');
        cargarDetalleCita();

    } catch (error) {
        console.error(error);
    }
}

// Función para cancelar cita
async function cancelarCita() {
    try {
        const response = await fetch(`/api/citas/${citaId}/cancelar/`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            const res = await response.json();
            alert(res.detail || 'Error al cancelar cita');
            return;
        }

        alert('Cita cancelada correctamente');
        cargarDetalleCita();

    } catch (error) {
        console.error(error);
    }
}

// Función para completar cita (solo profesionales)
async function completarCita() {
    try {
        const response = await fetch(`/api/citas/${citaId}/completar/`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            const res = await response.json();
            alert(res.detail || 'Error al completar cita');
            return;
        }

        alert('Cita completada correctamente');
        cargarDetalleCita()