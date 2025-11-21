document.addEventListener("DOMContentLoaded", initHistorial);

function handleUnauthorized() {
    toast.error('Sesión expirada. Por favor, inicia sesión');
    setTimeout(() => window.location.href = '/login/', 2000);
}

function getEstadoClass(estado) {
    const estadoClasses = {
        'pendiente': 'bg-yellow-100 text-yellow-800',
        'confirmada': 'bg-blue-100 text-blue-800',
        'completada': 'bg-green-100 text-green-800',
        'cancelada': 'bg-red-100 text-red-800'
    };
    return estadoClasses[estado] || 'bg-gray-100 text-gray-800';
}

async function cargarHistorial() {
    const token = localStorage.getItem('access');
    if (!token) return;

    try {
        const res = await fetch('/api/citas/historial/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            const refreshed = await window.refreshToken?.();
            if (refreshed) return cargarHistorial();
            handleUnauthorized();
            return;
        }

        if (!res.ok) throw new Error(`Error ${res.status} al cargar historial`);

        const citas = await res.json();
        const tbody = document.getElementById('historial-citas-list');
        tbody.innerHTML = '';

        if (citas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-gray-500">No hay historial de citas.</td></tr>';
            return;
        }

        const perfil = await window.getProfile();

        citas.forEach(cita => {
            const tr = document.createElement('tr');
            tr.className = 'border-b hover:bg-gray-50 transition';

            const nombre = perfil.is_professional
                ? `${cita.cliente?.first_name || ''} ${cita.cliente?.last_name || ''}`.trim()
                : `${cita.profesional?.first_name || ''} ${cita.profesional?.last_name || ''}`.trim();

            tr.innerHTML = `
                <td class="p-3 text-gray-700">${cita.fecha}</td>
                <td class="p-3 text-gray-700">${cita.hora}</td>
                <td class="p-3 text-gray-700">${nombre || 'No disponible'}</td>
                <td class="p-3">
                    <span class="px-3 py-1 rounded-full text-sm font-semibold ${getEstadoClass(cita.estado)} capitalize">
                        ${cita.estado}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Error cargando historial:", err);
        const tbody = document.getElementById('historial-citas-list');
        tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-red-500">Error al cargar historial</td></tr>';
        toast.error('No se pudo cargar el historial de citas');
    }
}

async function initHistorial() {
    let attempts = 0;
    while (typeof window.getProfile !== "function" && attempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    if (typeof window.getProfile !== "function") {
        console.error('auth.js no se cargó correctamente');
        toast.error('Error al cargar dependencias');
        return;
    }

    const perfil = await window.getProfile();
    if (!perfil) {
        handleUnauthorized();
        return;
    }

    cargarHistorial();
}