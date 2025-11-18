// detalle_cita.js

async function getCita(citaId, token) {
    console.log('=== getCita called ===');
    console.log('citaId:', citaId);
    console.log('token:', token ? 'exists' : 'missing');

    const url = `/api/citas/${citaId}/`;
    console.log('Fetching URL:', url);

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);

        if (res.status === 401) {
            console.log('Token expired, attempting refresh...');
            const refreshed = await window.refreshToken();
            if (refreshed) {
                console.log('Token refreshed successfully, retrying...');
                return getCita(citaId, localStorage.getItem('access'));
            } else {
                console.error('Failed to refresh token');
                return null;
            }
        }

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Error response:', errorText);
            throw new Error(`No se pudo obtener la cita: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        console.log('Cita data received:', data);
        return data;

    } catch (error) {
        console.error('Error in getCita:', error);
        throw error;
    }
}

function mostrarDetalles(cita, perfil) {
    console.log('=== mostrarDetalles called ===');
    console.log('cita:', cita);
    console.log('perfil:', perfil);

    const detalleDiv = document.getElementById('detalle-cita');

    if (!detalleDiv) {
        console.error('Element detalle-cita not found!');
        return;
    }

    // Formatear fecha y hora si es necesario
    const fecha = cita.fecha || 'No disponible';
    const hora = cita.hora || 'No disponible';
    const estado = cita.estado || 'No disponible';

    const profesionalNombre = cita.profesional
        ? `${cita.profesional.first_name || ''} ${cita.profesional.last_name || ''}`.trim()
        : 'No disponible';

    const clienteNombre = cita.cliente
        ? `${cita.cliente.first_name || ''} ${cita.cliente.last_name || ''}`.trim()
        : 'Libre';

    console.log('Rendering details...');
    detalleDiv.innerHTML = `
        <p><strong>Profesional:</strong> ${profesionalNombre}</p>
        <p><strong>Cliente:</strong> ${clienteNombre}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Hora:</strong> ${hora}</p>
        <p><strong>Estado:</strong> ${estado}</p>
    `;

    const btnEliminar = document.getElementById('btn-eliminar');
    btnEliminar.classList.add('hidden');

    if (perfil.is_professional) {
        if (cita.profesional && cita.profesional.id === perfil.id) {
            btnEliminar.classList.remove('hidden');
        }
    } else {
        if (cita.cliente && cita.cliente.id === perfil.id) {
            btnEliminar.classList.remove('hidden');
        }
    }

    // Evento
    btnEliminar.onclick = async () => {
        const token = localStorage.getItem('access');
        try {
            const res = await fetch(`/api/citas/${cita.id}/eliminar/`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            alert(data.detail || 'Acción completada');

            if (res.ok) {
                window.location.href = perfil.is_professional ? '/mis-citas/' : '/citas-disponibles/';
            }
        } catch (err) {
            console.error('Error al eliminar cita:', err);
        }
    };

    // Mostrar botones según rol y estado
    const btnReservar = document.getElementById('btn-reservar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnCompletar = document.getElementById('btn-completar');

    if (!btnReservar || !btnCancelar || !btnCompletar) {
        console.error('Some buttons not found!');
        return;
    }

    btnReservar.classList.add('hidden');
    btnCancelar.classList.add('hidden');
    btnCompletar.classList.add('hidden');

    console.log('Checking permissions...');
    console.log('User is professional:', perfil.is_professional);
    console.log('Cita estado:', cita.estado);

    if (perfil.is_professional) {
        console.log('User is professional');
        console.log('Cita profesional id:', cita.profesional?.id);
        console.log('User id:', perfil.id);

        // Profesional
        if (cita.profesional && cita.profesional.id === perfil.id) {
            console.log('Is own appointment');
            if (cita.estado === 'pendiente' || cita.estado === 'confirmada') {
                console.log('Showing cancel button');
                btnCancelar.classList.remove('hidden');
            }
            if (cita.estado === 'confirmada') {
                console.log('Showing complete button');
                btnCompletar.classList.remove('hidden');
            }
        }
    } else {
        console.log('User is client');
        // Cliente
        if (!cita.cliente && cita.estado === 'pendiente') {
            console.log('Showing reserve button');
            btnReservar.classList.remove('hidden');
        }
    }
}

async function reservarCita(citaId) {
    console.log('=== reservarCita called ===');
    const token = localStorage.getItem('access');

    try {
        const res = await fetch(`/api/citas/${citaId}/reservar/`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await res.json();
        console.log('Reserve response:', data);

        if (res.status === 401) {
            window.location.href = '/login/';
            return;
        }

        document.getElementById('cita-mensaje').innerText = data.detail || 'Acción completada';
        if (res.ok) {
            setTimeout(() => location.reload(), 1000);
        }
    } catch (error) {
        console.error('Error reserving:', error);
        document.getElementById('cita-mensaje').innerText = 'Error al reservar la cita';
    }
}

async function cancelarCita(citaId) {
    console.log('=== cancelarCita called ===');
    const token = localStorage.getItem('access');

    try {
        const res = await fetch(`/api/citas/${citaId}/cancelar/`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await res.json();
        console.log('Cancel response:', data);

        if (res.status === 401) {
            window.location.href = '/login/';
            return;
        }

        document.getElementById('cita-mensaje').innerText = data.detail || 'Acción completada';
        if (res.ok) {
            setTimeout(() => location.reload(), 1000);
        }
    } catch (error) {
        console.error('Error canceling:', error);
        document.getElementById('cita-mensaje').innerText = 'Error al cancelar la cita';
    }
}

async function completarCita(citaId) {
    console.log('=== completarCita called ===');
    const token = localStorage.getItem('access');

    try {
        const res = await fetch(`/api/citas/${citaId}/completar/`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await res.json();
        console.log('Complete response:', data);

        if (res.status === 401) {
            window.location.href = '/login/';
            return;
        }

        document.getElementById('cita-mensaje').innerText = data.detail || 'Acción completada';
        if (res.ok) {
            setTimeout(() => location.reload(), 1000);
        }
    } catch (error) {
        console.error('Error completing:', error);
        document.getElementById('cita-mensaje').innerText = 'Error al completar la cita';
    }
}

async function init() {
    console.log('=== INIT STARTED ===');
    console.log('Current URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);

    try {
        console.log('Getting profile...');
        const perfil = await window.getProfile();
        console.log('Profile:', perfil);

        if (!perfil) {
            console.error('No profile found, redirecting to login');
            window.location.href = '/login/';
            return;
        }

        // Obtener ID de la cita desde URL: /cita/<id>/
        const pathParts = window.location.pathname.split('/').filter(part => part !== '');
        console.log('Path parts:', pathParts);

        // Buscar el ID después de 'cita'
        const citaIndex = pathParts.indexOf('cita');
        console.log('cita index:', citaIndex);

        const citaId = citaIndex !== -1 ? pathParts[citaIndex + 1] : null;
        console.log('Extracted cita ID:', citaId);

        if (!citaId) {
            console.error('No cita ID found in URL');
            document.getElementById('detalle-cita').innerText = 'ID de cita no encontrado en la URL.';
            return;
        }

        const token = localStorage.getItem('access');
        console.log('Access token:', token ? 'exists' : 'missing');

        if (!token) {
            console.error('No access token');
            window.location.href = '/login/';
            return;
        }

        console.log('Calling getCita...');
        const cita = await getCita(citaId, token);

        if (!cita) {
            console.error('getCita returned null');
            document.getElementById('detalle-cita').innerText = 'No se pudo cargar la cita.';
            return;
        }

        console.log('Calling mostrarDetalles...');
        mostrarDetalles(cita, perfil);

        // Botones
        console.log('Attaching button handlers...');
        document.getElementById('btn-reservar').onclick = () => reservarCita(citaId);
        document.getElementById('btn-cancelar').onclick = () => cancelarCita(citaId);
        document.getElementById('btn-completar').onclick = () => completarCita(citaId);

        console.log('=== INIT COMPLETED ===');

    } catch (err) {
        console.error('=== ERROR IN INIT ===');
        console.error('Error type:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        document.getElementById('detalle-cita').innerText = 'Error al cargar la cita: ' + err.message;
    }
}

// Esperar a que DOM esté listo
document.addEventListener("DOMContentLoaded", async () => {
    // Esperar hasta que getProfile esté definido
    while (typeof window.getProfile !== "function") {
        console.log("Esperando a que auth.js cargue...");
        await new Promise(r => setTimeout(r, 50));
    }

    console.log("auth.js cargado, inicializando detalle de cita...");
    init();
});