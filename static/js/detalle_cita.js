// detalle_cita.js - Gestión de detalle de cita

/**
 * Obtener datos de una cita específica
 */
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

/**
 * Mostrar detalles de la cita en el DOM
 */
function mostrarDetalles(cita, perfil) {
    const detalleDiv = document.getElementById('detalle-cita');

    if (!detalleDiv) {
        console.error('Elemento detalle-cita no encontrado');
        return;
    }

    // Formatear datos
    const fecha = cita.fecha || 'No disponible';
    const hora = cita.hora || 'No disponible';
    const estado = cita.estado || 'No disponible';

    const profesionalNombre = cita.profesional
        ? `${cita.profesional.first_name || ''} ${cita.profesional.last_name || ''}`.trim()
        : 'No disponible';

    const clienteNombre = cita.cliente
        ? `${cita.cliente.first_name || ''} ${cita.cliente.last_name || ''}`.trim()
        : 'Libre';

    // Mapeo de estados con colores
    const estadoClasses = {
        'pendiente': 'text-yellow-600',
        'confirmada': 'text-blue-600',
        'completada': 'text-green-600',
        'cancelada': 'text-red-600'
    };

    const estadoClass = estadoClasses[cita.estado] || 'text-gray-600';

    // Renderizar HTML
    detalleDiv.innerHTML = `
        <div class="space-y-3">
            <div class="grid grid-cols-2 gap-4">
                <div class="text-left">
                    <p class="text-gray-600 text-sm">Profesional</p>
                    <p class="font-semibold">${profesionalNombre}</p>
                </div>
                <div class="text-left">
                    <p class="text-gray-600 text-sm">Cliente</p>
                    <p class="font-semibold">${clienteNombre}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="text-left">
                    <p class="text-gray-600 text-sm">Fecha</p>
                    <p class="font-semibold">${fecha}</p>
                </div>
                <div class="text-left">
                    <p class="text-gray-600 text-sm">Hora</p>
                    <p class="font-semibold">${hora}</p>
                </div>
            </div>
            <div class="text-left">
                <p class="text-gray-600 text-sm">Estado</p>
                <p class="font-semibold ${estadoClass} uppercase">${estado}</p>
            </div>
        </div>
    `;

    // Configurar visibilidad de botones
    configurarBotones(cita, perfil);
}

/**
 * Configurar visibilidad y eventos de botones según rol y estado
 */
function configurarBotones(cita, perfil) {
    const btnReservar = document.getElementById('btn-reservar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnCompletar = document.getElementById('btn-completar');
    const btnEliminar = document.getElementById('btn-eliminar');

    // Verificar que todos los botones existen
    if (!btnReservar || !btnCancelar || !btnCompletar || !btnEliminar) {
        console.error('Algunos botones no se encontraron en el DOM');
        return;
    }

    // Ocultar todos por defecto
    btnReservar.classList.add('hidden');
    btnCancelar.classList.add('hidden');
    btnCompletar.classList.add('hidden');
    btnEliminar.classList.add('hidden');

    if (perfil.is_professional) {
        // ===== PROFESIONAL =====
        if (cita.profesional && cita.profesional.id === perfil.id) {
            // Botón CANCELAR - para citas pendientes o confirmadas
            if (cita.estado === 'pendiente' || cita.estado === 'confirmada') {
                btnCancelar.classList.remove('hidden');
                btnCancelar.onclick = () => showConfirmation(
                    '¿Estás seguro de que deseas cancelar esta cita?',
                    'Esta acción notificará al cliente.',
                    () => cancelarCita(cita.id)
                );
            }

            // Botón COMPLETAR - solo para citas confirmadas
            if (cita.estado === 'confirmada') {
                btnCompletar.classList.remove('hidden');
                btnCompletar.onclick = () => showConfirmation(
                    '¿Marcar esta cita como completada?',
                    'Esta acción es permanente.',
                    () => completarCita(cita.id)
                );
            }

            // Botón ELIMINAR - profesional puede eliminar sus propias citas
            btnEliminar.classList.remove('hidden');
            btnEliminar.onclick = () => showConfirmation(
                '¿Estás seguro de que deseas eliminar esta cita?',
                'Esta acción no se puede deshacer.',
                () => eliminarCita(cita.id, perfil),
                true // Marcar como peligrosa
            );
        }
    } else {
        // ===== CLIENTE =====

        // Botón RESERVAR - solo si la cita está libre y pendiente
        if (!cita.cliente && cita.estado === 'pendiente') {
            btnReservar.classList.remove('hidden');
            btnReservar.onclick = () => showConfirmation(
                '¿Deseas reservar esta cita?',
                `Fecha: ${cita.fecha} - Hora: ${cita.hora}`,
                () => reservarCita(cita.id)
            );
        }

        // Botón CANCELAR - si el cliente tiene la cita reservada
        if (cita.cliente && cita.cliente.id === perfil.id) {
            if (cita.estado === 'pendiente' || cita.estado === 'confirmada') {
                btnCancelar.classList.remove('hidden');
                btnCancelar.onclick = () => showConfirmation(
                    '¿Estás seguro de que deseas cancelar tu reserva?',
                    'Podrás reservar otra cita más tarde.',
                    () => cancelarCita(cita.id)
                );
            }

            // Cliente puede eliminar su propia reserva
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

/**
 * Reservar una cita
 */
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

/**
 * Cancelar una cita
 */
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

/**
 * Completar una cita
 */
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

/**
 * Eliminar una cita
 */
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

/**
 * Mostrar modal de confirmación
 */
function showConfirmation(title, message, action, isDangerous = false) {
    let modal = document.getElementById('modal-confirm');

    // Crear modal si no existe
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-confirm';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-96 shadow-2xl">
                <h2 id="modal-title" class="text-xl font-bold mb-3"></h2>
                <p id="modal-message" class="text-gray-600 mb-6"></p>
                <div class="flex justify-end space-x-3">
                    <button id="modal-cancel"
                            class="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition">
                        Cancelar
                    </button>
                    <button id="modal-accept"
                            class="px-5 py-2 text-white rounded-lg transition">
                        Aceptar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Configurar contenido
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;

    // Configurar color del botón según si es peligroso
    const acceptBtn = document.getElementById('modal-accept');
    if (isDangerous) {
        acceptBtn.className = 'px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition';
    } else {
        acceptBtn.className = 'px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition';
    }

    // Mostrar modal
    modal.classList.remove('hidden');

    // Eventos de los botones
    document.getElementById('modal-cancel').onclick = () => {
        modal.classList.add('hidden');
    };

    document.getElementById('modal-accept').onclick = () => {
        modal.classList.add('hidden');
        action();
    };

    // Cerrar con ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.classList.add('hidden');
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // Cerrar al hacer clic fuera
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    };
}

/**
 * Inicializar la página de detalle de cita
 */
async function init() {
    try {
        // Obtener perfil del usuario
        const perfil = await window.getProfile();

        if (!perfil) {
            toast.error('Debes iniciar sesión para ver esta cita');
            setTimeout(() => window.location.href = '/login/', 2000);
            return;
        }

        // Extraer ID de la cita desde la URL: /cita/<id>/
        const pathParts = window.location.pathname.split('/').filter(part => part !== '');
        const citaIndex = pathParts.indexOf('cita');
        const citaId = citaIndex !== -1 ? pathParts[citaIndex + 1] : null;

        if (!citaId) {
            toast.error('ID de cita no encontrado en la URL');
            document.getElementById('detalle-cita').innerHTML =
                '<p class="text-red-500">ID de cita no válido</p>';
            return;
        }

        const token = localStorage.getItem('access');

        if (!token) {
            toast.error('Sesión no válida. Por favor, inicia sesión');
            setTimeout(() => window.location.href = '/login/', 2000);
            return;
        }

        // Obtener datos de la cita
        const cita = await getCita(citaId, token);

        if (!cita) {
            document.getElementById('detalle-cita').innerHTML =
                '<p class="text-red-500">No se pudo cargar la cita</p>';
            return;
        }

        // Mostrar detalles
        mostrarDetalles(cita, perfil);

    } catch (err) {
        console.error('Error en inicialización:', err);
        toast.error('Error al cargar los detalles de la cita');
        document.getElementById('detalle-cita').innerHTML =
            `<p class="text-red-500">Error: ${err.message}</p>`;
    }
}

/**
 * Esperar a que se cargue el DOM y las dependencias
 */
document.addEventListener("DOMContentLoaded", async () => {
    // Esperar a que auth.js esté cargado
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

    // Inicializar
    init();
});