// historial_citas.js - Gestión de la lista de historial de citas
document.addEventListener("DOMContentLoaded", initHistorial);

/**
 * Manejar expiración de sesión
 */
function handleUnauthorized() {
    toast.error('Sesión expirada. Por favor, inicia sesión');
    setTimeout(() => window.location.href = '/login/', 2000);
}

/**
 * Devuelve clase Tailwind según estado
 */
function getEstadoClass(estado) {
    const estadoClasses = {
        'pendiente': 'text-yellow-600',
        'confirmada': 'text-blue-600',
        'completada': 'text-green-600',
        'cancelada': 'text-red-600'
    };
    return estadoClasses[estado] || 'text-gray-600';
}

/**
 * Obtener historial de citas
 */
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
        if (!tbody) {
            console.error('No se encontró el elemento tbody #historial-citas');
            return;
        }
        tbody.innerHTML = '';

        if (citas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-gray-500">No hay historial de citas.</td></tr>';
            return;
        }

        const perfil = await window.getProfile();

        citas.forEach(cita => {
            const tr = document.createElement('tr');
            tr.className = 'border-b';

            const nombre = perfil.is_professional
                ? `${cita.cliente?.first_name || ''} ${cita.cliente?.last_name || ''}`.trim()
                : `${cita.profesional?.first_name || ''} ${cita.profesional?.last_name || ''}`.trim();

            tr.innerHTML = `
                <td class="p-2">${cita.fecha}</td>
                <td class="p-2">${cita.hora}</td>
                <td class="p-2">${nombre || 'No disponible'}</td>
                <td class="p-2 capitalize ${getEstadoClass(cita.estado)}">${cita.estado}</td>
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

/**
 * Inicializar la página
 */
async function initHistorial() {
    // Esperar que auth.js esté cargado
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

    // Cargar historial
    cargarHistorial();
}