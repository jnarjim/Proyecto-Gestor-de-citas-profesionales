document.addEventListener("DOMContentLoaded", initHistorial);

function handleUnauthorized() {
    toast.error('Sesión expirada. Por favor, inicia sesión');
    setTimeout(() => window.location.href = '/login/', 2000);
}

function getEstadoInfo(estado) {
    const estados = {
        'pendiente': {
            text: 'Pendiente',
            class: 'bg-yellow-100 text-yellow-800',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        'confirmada': {
            text: 'Confirmada',
            class: 'bg-blue-100 text-blue-800',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        'completada': {
            text: 'Completada',
            class: 'bg-green-100 text-green-800',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>`
        },
        'cancelada': {
            text: 'Cancelada',
            class: 'bg-red-100 text-red-800',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>`
        }
    };
    return estados[estado] || {
        text: estado,
        class: 'bg-gray-100 text-gray-800',
        icon: ''
    };
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
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="py-16 text-center">
                        <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p class="text-lg text-gray-600 mb-2">No hay historial de citas</p>
                        <p class="text-gray-500">Tus citas pasadas aparecerán aquí</p>
                    </td>
                </tr>
            `;
            return;
        }

        const perfil = await window.getProfile();

        // Ordenar por fecha descendente (más recientes primero)
        citas.sort((a, b) => {
            const dateA = new Date(`${a.fecha} ${a.hora}`);
            const dateB = new Date(`${b.fecha} ${b.hora}`);
            return dateB - dateA;
        });

        citas.forEach(cita => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-200 hover:bg-indigo-50 transition';

            const nombre = perfil.is_professional
                ? `${cita.cliente?.first_name || ''} ${cita.cliente?.last_name || ''}`.trim()
                : `${cita.profesional?.first_name || ''} ${cita.profesional?.last_name || ''}`.trim();

            const estadoInfo = getEstadoInfo(cita.estado);

            // Formatear fecha (opcional: más legible)
            const fechaObj = new Date(cita.fecha);
            const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            tr.innerHTML = `
                <td class="p-4">
                    <div class="flex items-center text-gray-700">
                        <svg class="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <div>
                            <div class="font-semibold">${cita.fecha}</div>
                            <div class="text-xs text-gray-500">${fechaFormateada}</div>
                        </div>
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex items-center text-gray-700">
                        <svg class="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-medium">${cita.hora}</span>
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex items-center text-gray-700">
                        <svg class="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span class="font-medium">${nombre || 'No disponible'}</span>
                    </div>
                </td>
                <td class="p-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${estadoInfo.class}">
                        ${estadoInfo.icon}
                        ${estadoInfo.text}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Error cargando historial:", err);
        const tbody = document.getElementById('historial-citas-list');
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="py-16 text-center">
                    <svg class="w-20 h-20 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-lg text-red-600 mb-4">Error al cargar el historial</p>
                    <button onclick="location.reload()" class="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Reintentar
                    </button>
                </td>
            </tr>
        `;
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