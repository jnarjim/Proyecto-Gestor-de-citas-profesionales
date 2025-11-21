async function getCita(citaId, token) {
    const url = `/api/citas/${citaId}/`;

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            const refreshed = await window.refreshToken();
            if (refreshed) {
                return getCita(citaId, localStorage.getItem('access'));
            } else {
                toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
                setTimeout(() => window.location.href = '/login/', 2000);
                return null;
            }
        }

        if (!res.ok) {
            throw new Error(`Error ${res.status}: No se pudo obtener la cita`);
        }

        return await res.json();

    } catch (error) {
        console.error('Error al obtener cita:', error);
        toast.error('Error al cargar los detalles de la cita');
        throw error;
    }
}

function mostrarDetalles(cita, perfil) {
    const detalleDiv = document.getElementById('detalle-cita');

    if (!detalleDiv) {
        console.error('Elemento detalle-cita no encontrado');
        return;
    }

    const fecha = cita.fecha || 'No disponible';
    const hora = cita.hora || 'No disponible';
    const estado = cita.estado || 'No disponible';

    const profesionalNombre = cita.profesional
        ? `${cita.profesional.first_name || ''} ${cita.profesional.last_name || ''}`.trim()
        : 'No disponible';

    const clienteNombre = cita.cliente
        ? `${cita.cliente.first_name || ''} ${cita.cliente.last_name || ''}`.trim()
        : 'Libre';

    const estadoInfo = getEstadoInfo(cita.estado);

    detalleDiv.innerHTML = `
        <!-- Estado badge destacado -->
        <div class="mb-8 flex justify-center">
            <span class="inline-flex items-center px-6 py-3 rounded-full text-base font-semibold ${estadoInfo.bgColor} ${estadoInfo.textColor}">
                ${estadoInfo.icon}
                ${estadoInfo.text}
            </span>
        </div>

        <!-- Grid de información -->
        <div class="space-y-6">
            <!-- Profesional y Cliente -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-blue-50 rounded-xl p-5 border-l-4 border-blue-500">
                    <div class="flex items-center mb-3">
                        <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-sm font-medium text-blue-800">Profesional</p>
                    </div>
                    <p class="text-lg font-bold text-gray-800">${profesionalNombre}</p>
                </div>

                <div class="bg-green-50 rounded-xl p-5 border-l-4 border-green-500">
                    <div class="flex items-center mb-3">
                        <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <p class="text-sm font-medium text-green-800">Cliente</p>
                    </div>
                    <p class="text-lg font-bold text-gray-800">${clienteNombre}</p>
                </div>
            </div>

            <!-- Fecha y Hora -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-purple-50 rounded-xl p-5 border-l-4 border-purple-500">
                    <div class="flex items-center mb-3">
                        <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-sm font-medium text-purple-800">Fecha</p>
                    </div>
                    <p class="text-lg font-bold text-gray-800">${fecha}</p>
                </div>

                <div class="bg-orange-50 rounded-xl p-5 border-l-4 border-orange-500">
                    <div class="flex items-center mb-3">
                        <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm font-medium text-orange-800">Hora</p>
                    </div>
                    <p class="text-lg font-bold text-gray-800">${hora}</p>
                </div>
            </div>
        </div>
    `;

    configurarBotones(cita, perfil);
}

function getEstadoInfo(estado) {
    const estados = {
        'pendiente': {
            text: 'Pendiente',
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            icon: `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        'confirmada': {
            text: 'Confirmada',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            icon: `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        'completada': {
            text: 'Completada',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            icon: `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>`
        },
        'cancelada': {
            text: 'Cancelada',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            icon: `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>`
        }
    };
    return estados[estado] || {
        text: estado,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: ''
    };
}

function configurarBotones(cita, perfil) {
    const btnReservar = document.getElementById('btn-reservar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnCompletar = document.getElementById('btn-completar');
    const btnEliminar = document.getElementById('btn-eliminar');

    if (!btnReservar || !btnCancelar || !btnCompletar || !btnEliminar) {
        console.error('Algunos botones no se encontraron en el DOM');
        return;
    }

    btnReservar.classList.add('hidden');
    btnCancelar.classList.add('hidden');
    btnCompletar.classList.add('hidden');
    btnEliminar.classList.add('hidden');

    if (perfil.is_professional) {
        if (cita.profesional && cita.profesional.id === perfil.id) {
            if (cita.estado === 'pendiente' || cita.estado === 'confirmada') {
                btnCancelar.classList.remove('hidden');
                btnCancelar.onclick = () => showConfirmation(
                    '¿Estás seguro de que deseas cancelar esta cita?',
                    'Esta acción notificará al cliente.',
                    () => cancelarCita(cita.id)
                );
            }

            if (cita.estado === 'confirmada') {
                btnCompletar.classList.remove('hidden');
                btnCompletar.onclick = () => showConfirmation(
                    '¿Marcar esta cita como completada?',
                    'Esta acción es permanente.',
                    () => completarCita(cita.id)
                );
            }

            btnEliminar.classList.remove('hidden');
            btnEliminar.onclick = () => showConfirmation(
                '¿Estás seguro de que deseas eliminar esta cita?',
                'Esta acción no se puede deshacer.',
                () => eliminarCita(cita.id, perfil),
                true
            );
        }
    } else {
        if (!cita.cliente && cita.estado === 'pendiente') {
            btnReservar.classList.remove('hidden');
            btnReservar.onclick = () => showConfirmation(
                '¿Deseas reservar esta cita?',
                `Fecha: ${cita.fecha} - Hora: ${cita.hora}`,
                () => reservarCita(cita.id)
            );
        }

        if (cita.cliente && cita.cliente.id === perfil.id) {
            if (cita.estado === 'pendiente' || cita.estado === 'confirmada') {
                btnCancelar.classList.remove('hidden');
                btnCancelar.onclick = () => showConfirmation(
                    '¿Estás seguro de que deseas cancelar tu reserva?',
                    'Podrás reservar otra cita más tarde.',
                    () => cancelarCita(cita.id)
                );
            }

            btnEliminar.classList.remove('hidden');
            btnEliminar.onclick = () => showConfirmation(
                '¿Estás seguro de que deseas eliminar esta cita?',
                'Esta acción no se puede deshacer.',
                () => eliminarCita(cita.id, perfil),
                true
            );
        }
    }
}

async function reservarCita(citaId) {
    const token = localStorage.getItem('access');

    try {
        const res = await fetch(`/api/citas/${citaId}/reservar/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.status === 401) {
            toast.error('Sesión expirada. Por favor, inicia sesión');
            setTimeout(() => window.location.href = '/login/', 2000);
            return;
        }

        if (res.ok) {
            toast.success(data.detail || '¡Cita reservada exitosamente!');
            setTimeout(() => location.reload(), 1500);
        } else {
            toast.error(data.detail || 'No se pudo reservar la cita');
        }
    } catch (error) {
        console.error('Error al reservar cita:', error);
        toast.error('Error de conexión al reservar la cita');
    }
}

async function cancelarCita(citaId) {
    const token = localStorage.getItem('access');

    try {
        const res = await fetch(`/api/citas/${citaId}/cancelar/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.status === 401) {
            toast.error('Sesión expirada. Por favor, inicia sesión');
            setTimeout(() => window.location.href = '/login/', 2000);
            return;
        }

        if (res.ok) {
            toast.success(data.detail || 'Cita cancelada correctamente');
            setTimeout(() => location.reload(), 1500);
        } else {
            toast.error(data.detail || 'No se pudo cancelar la cita');
        }
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        toast.error('Error de conexión al cancelar la cita');
    }
}

async function completarCita(citaId) {
    const token = localStorage.getItem('access');

    try {
        const res = await fetch(`/api/citas/${citaId}/completar/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.status === 401) {
            toast.error('Sesión expirada. Por favor, inicia sesión');
            setTimeout(() => window.location.href = '/login/', 2000);
            return;
        }

        if (res.ok) {
            toast.success(data.detail || '¡Cita completada exitosamente!');
            setTimeout(() => location.reload(), 1500);
        } else {
            toast.error(data.detail || 'No se pudo completar la cita');
        }
    } catch (error) {
        console.error('Error al completar cita:', error);
        toast.error('Error de conexión al completar la cita');
    }
}

async function eliminarCita(citaId, perfil) {
    const token = localStorage.getItem('access');

    try {
        const res = await fetch(`/api/citas/${citaId}/eliminar/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.status === 401) {
            toast.error('Sesión expirada. Por favor, inicia sesión');
            setTimeout(() => window.location.href = '/login/', 2000);
            return;
        }

        if (res.ok) {
            toast.success(data.detail || 'Cita eliminada correctamente');
            const redirectUrl = perfil.is_professional ? '/mis-citas/' : '/citas-disponibles/';
            setTimeout(() => window.location.href = redirectUrl, 1500);
        } else {
            toast.error(data.detail || 'No se pudo eliminar la cita');
        }
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        toast.error('Error de conexión al eliminar la cita');
    }
}

function showConfirmation(title, message, action, isDangerous = false) {
    let modal = document.getElementById('modal-confirm');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-confirm';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
                <h2 id="modal-title" class="text-xl font-bold mb-3 text-gray-800"></h2>
                <p id="modal-message" class="text-gray-600 mb-6"></p>
                <div class="flex flex-col sm:flex-row justify-end gap-3">
                    <button id="modal-cancel"
                            class="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
                        Cancelar
                    </button>
                    <button id="modal-accept"
                            class="px-5 py-2 text-white rounded-lg transition font-medium">
                        Aceptar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;

    const acceptBtn = document.getElementById('modal-accept');
    if (isDangerous) {
        acceptBtn.className = 'px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md hover:shadow-lg';
    } else {
        acceptBtn.className = 'px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg';
    }

    modal.classList.remove('hidden');

    document.getElementById('modal-cancel').onclick = () => {
        modal.classList.add('hidden');
    };

    document.getElementById('modal-accept').onclick = () => {
        modal.classList.add('hidden');
        action();
    };

    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.classList.add('hidden');
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    };
}

async function init() {
    try {
        const perfil = await window.getProfile();

        if (!perfil) {
            toast.error('Debes iniciar sesión para ver esta cita');
            setTimeout(() => window.location.href = '/login/', 2000);
            return;
        }

        const pathParts = window.location.pathname.split('/').filter(part => part !== '');
        const citaIndex = pathParts.indexOf('cita');
        const citaId = citaIndex !== -1 ? pathParts[citaIndex + 1] : null;

        if (!citaId) {
            toast.error('ID de cita no encontrado en la URL');
            document.getElementById('detalle-cita').innerHTML =
                '<p class="text-red-500 text-center py-8">ID de cita no válido</p>';
            return;
        }

        const token = localStorage.getItem('access');

        if (!token) {
            toast.error('Sesión no válida. Por favor, inicia sesión');
            setTimeout(() => window.location.href = '/login/', 2000);
            return;
        }

        const cita = await getCita(citaId, token);

        if (!cita) {
            document.getElementById('detalle-cita').innerHTML =
                '<p class="text-red-500 text-center py-8">No se pudo cargar la cita</p>';
            return;
        }

        mostrarDetalles(cita, perfil);

    } catch (err) {
        console.error('Error en inicialización:', err);
        toast.error('Error al cargar los detalles de la cita');
        document.getElementById('detalle-cita').innerHTML =
            `<p class="text-red-500 text-center py-8">Error: ${err.message}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
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

    init();
});