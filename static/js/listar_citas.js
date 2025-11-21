document.addEventListener("DOMContentLoaded", init);

function handleUnauthorized() {
    toast.error('Sesión expirada. Por favor, inicia sesión');
    setTimeout(() => window.location.href = '/login/', 2000);
}

async function cargarMisCitas() {
    const token = localStorage.getItem('access');
    if (!token) return;

    try {
        const res = await fetch('/api/citas/mis-citas/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            const refreshed = await window.refreshToken();
            if (refreshed) return cargarMisCitas();
            handleUnauthorized();
            return;
        }

        if (!res.ok) throw new Error(`Error ${res.status} al cargar citas`);

        const citas = await res.json();
        const ul = document.getElementById('mis-citas-list');
        ul.innerHTML = '';

        if (citas.length === 0) {
            ul.innerHTML = `
                <li class="text-center py-12">
                    <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p class="text-lg text-gray-500 mb-2">No tienes citas programadas</p>
                    <p class="text-gray-400">Tus citas futuras aparecerán aquí</p>
                </li>
            `;
            return;
        }

        citas.forEach(cita => {
            const li = document.createElement('li');

            const nombreProfesional = cita.profesional
                ? `${cita.profesional.first_name} ${cita.profesional.last_name || ''}`.trim()
                : 'No disponible';

            const estadoInfo = getEstadoInfo(cita.estado);

            li.className = 'border-l-4 bg-gray-50 rounded-r-lg hover:bg-gray-100 transition';
            li.style.borderLeftColor = estadoInfo.borderColor;

            li.innerHTML = `
                <a href="/cita/${cita.id}/" class="block p-5">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <!-- Info principal -->
                        <div class="flex-1">
                            <div class="flex items-center mb-3">
                                <div class="flex items-center text-gray-700 mr-4">
                                    <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <span class="font-semibold">${cita.fecha}</span>
                                </div>
                                <div class="flex items-center text-gray-700">
                                    <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span class="font-medium">${cita.hora}</span>
                                </div>
                            </div>
                            <div class="flex items-center text-gray-600">
                                <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                <span>Con <strong>${nombreProfesional}</strong></span>
                            </div>
                        </div>

                        <!-- Estado badge -->
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${estadoInfo.bgColor} ${estadoInfo.textColor}">
                                ${estadoInfo.icon}
                                ${estadoInfo.text}
                            </span>
                        </div>
                    </div>
                </a>
            `;
            ul.appendChild(li);
        });

    } catch (err) {
        console.error("Error cargando citas:", err);
        const ul = document.getElementById('mis-citas-list');
        ul.innerHTML = `
            <li class="text-center py-12">
                <svg class="w-20 h-20 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-lg text-red-500">Error al cargar citas</p>
            </li>
        `;
        toast.error('No se pudieron cargar las citas');
    }
}

function getEstadoInfo(estado) {
    const estados = {
        'pendiente': {
            text: 'Pendiente',
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            borderColor: '#F59E0B',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        'confirmada': {
            text: 'Confirmada',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            borderColor: '#3B82F6',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        'completada': {
            text: 'Completada',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            borderColor: '#10B981',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>`
        },
        'cancelada': {
            text: 'Cancelada',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            borderColor: '#EF4444',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>`
        }
    };
    return estados[estado] || {
        text: estado,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: '#6B7280',
        icon: ''
    };
}

async function init() {
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

    // Mostrar botón crear cita solo para profesionales
    if (perfil.is_professional) {
        const btnDiv = document.getElementById("btn-crear-cita");
        btnDiv.innerHTML = `
            <a href="/crear-cita/"
               class="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md hover:shadow-lg">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Crear Nueva Cita
            </a>
        `;
    }

    cargarMisCitas();
}