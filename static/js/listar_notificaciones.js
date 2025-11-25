document.addEventListener("DOMContentLoaded", cargarNotificaciones);

let notificacionesData = [];

async function cargarNotificaciones() {
    const contenedor = document.getElementById("lista-notificaciones");

    try {
        notificacionesData = await window.getNotifications();

        // Actualizar contadores
        actualizarContadores();

        if (notificacionesData.length === 0) {
            contenedor.innerHTML = `
                <div class="py-16 text-center">
                    <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p class="text-lg text-gray-600 mb-2">No tienes notificaciones</p>
                    <p class="text-gray-500">Te notificaremos cuando haya novedades</p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = "";
        renderizarNotificaciones();

    } catch (err) {
        console.error("Error cargando notificaciones:", err);
        contenedor.innerHTML = `
            <div class="py-16 text-center">
                <svg class="w-20 h-20 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-lg text-red-600 mb-4">Error al cargar notificaciones</p>
                <button onclick="location.reload()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                    Reintentar
                </button>
            </div>
        `;
        window.toast?.error("No se pudieron cargar las notificaciones");
    }
}

function renderizarNotificaciones() {
    const contenedor = document.getElementById("lista-notificaciones");
    contenedor.innerHTML = "";

    notificacionesData.forEach(n => {
        const item = document.createElement("div");
        item.className = `p-5 transition hover:bg-blue-50`;
        item.dataset.notifId = n.id;

        // Construir destino según cita_id
        let destino = "/";
        if (n.cita_id) destino = `/cita/${n.cita_id}/`;

        // Formatear fecha
        const fecha = new Date(n.creada_en);
        const fechaFormateada = fecha.toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        item.innerHTML = `
            <div class="flex items-start justify-between gap-4">
                <!-- Contenido principal -->
                <div class="flex-1 cursor-pointer" onclick="irANotificacion('${destino}', ${n.id})">
                    <div class="flex items-start mb-2">
                        <!-- Icono -->
                        <div class="flex-shrink-0 mt-1 mr-3">
                            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 16h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                </svg>
                            </div>
                        </div>

                        <!-- Mensaje -->
                        <div class="flex-1">
                            <p class="text-gray-900 font-medium mb-1">
                                ${n.mensaje}
                            </p>
                            <div class="flex items-center text-sm text-gray-500">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                ${fechaFormateada}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Botón eliminar -->
                <div>
                    <button
                        onclick="eliminarNotificacion(event, ${n.id})"
                        class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Eliminar notificación"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        contenedor.appendChild(item);
    });
}

function actualizarContadores() {
    const total = notificacionesData.length;

    document.getElementById('count-total').textContent = total;

    const subtitle = document.getElementById('notif-subtitle');
    const hint = document.getElementById('notif-hint');

    if (total > 0) {
        subtitle.textContent = `Tienes ${total} notificación${total === 1 ? '' : 'es'}`;
        hint.textContent = 'Haz clic en una notificación para verla y eliminarla';
    } else {
        subtitle.textContent = 'Estás al día con tus notificaciones';
        hint.textContent = '';
    }

    // Mostrar/ocultar botón "Eliminar todas"
    const btnEliminarTodas = document.getElementById('btn-eliminar-todas');
    if (total > 0) {
        btnEliminarTodas.classList.remove('hidden');
    } else {
        btnEliminarTodas.classList.add('hidden');
    }
}

// Función global para ir a la notificación (marca como leída y elimina)
window.irANotificacion = async function(destino, notifId) {
    try {
        // Marcar como leída en el servidor
        await window.markAsRead(notifId);

        // Intentar eliminar del servidor si existe el método
        if (typeof window.deleteNotification === 'function') {
            await window.deleteNotification(notifId);
        }

        // Redirigir
        window.location.href = destino;
    } catch (err) {
        console.error("Error procesando notificación:", err);
        // Redirigir de todos modos
        window.location.href = destino;
    }
}

// Eliminar una notificación
window.eliminarNotificacion = async function(event, notifId) {
    event.stopPropagation();

    try {
        // Primero marcar como leída
        await window.markAsRead(notifId);

        // Intentar eliminar del servidor si existe el método
        if (typeof window.deleteNotification === 'function') {
            await window.deleteNotification(notifId);
        }

        // Eliminar del array local con animación
        const notifElement = document.querySelector(`[data-notif-id="${notifId}"]`);
        if (notifElement) {
            notifElement.style.transition = 'all 0.3s ease';
            notifElement.style.opacity = '0';
            notifElement.style.transform = 'translateX(100%)';

            setTimeout(() => {
                notificacionesData = notificacionesData.filter(n => n.id !== notifId);
                renderizarNotificaciones();
                actualizarContadores();

                // Si no quedan notificaciones, mostrar empty state
                if (notificacionesData.length === 0) {
                    const contenedor = document.getElementById("lista-notificaciones");
                    contenedor.innerHTML = `
                        <div class="py-16 text-center">
                            <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                            </svg>
                            <p class="text-lg text-gray-600 mb-2">No tienes notificaciones</p>
                            <p class="text-gray-500">Te notificaremos cuando haya novedades</p>
                        </div>
                    `;
                }
            }, 300);
        }

        window.toast?.success("Notificación eliminada");
    } catch (err) {
        console.error("Error eliminando notificación:", err);
        window.toast?.error("No se pudo eliminar la notificación");
    }
}

// Eliminar todas las notificaciones
document.addEventListener('DOMContentLoaded', () => {
    const btnEliminarTodas = document.getElementById('btn-eliminar-todas');

    if (btnEliminarTodas) {
        btnEliminarTodas.addEventListener('click', () => {
            showConfirmation(
                '¿Eliminar todas las notificaciones?',
                'Esta acción eliminará todas tus notificaciones y no se puede deshacer.',
                async () => {
                    try {
                        // Eliminar todas del servidor
                        for (const notif of notificacionesData) {
                            await window.markAsRead(notif.id);
                            // Intentar eliminar si existe el método
                            if (typeof window.deleteNotification === 'function') {
                                await window.deleteNotification(notif.id);
                            }
                        }

                        // Limpiar array local
                        notificacionesData = [];

                        // Mostrar empty state
                        const contenedor = document.getElementById("lista-notificaciones");
                        contenedor.innerHTML = `
                            <div class="py-16 text-center">
                                <svg class="w-20 h-20 mx-auto mb-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <p class="text-lg text-gray-600 mb-2">Todas las notificaciones eliminadas</p>
                                <p class="text-gray-500">Te notificaremos cuando haya novedades</p>
                            </div>
                        `;

                        actualizarContadores();

                        window.toast?.success("Todas las notificaciones eliminadas");
                    } catch (err) {
                        console.error("Error eliminando todas las notificaciones:", err);
                        window.toast?.error("No se pudieron eliminar todas las notificaciones");
                    }
                }
            );
        });
    }
});

// Modal de confirmación
function showConfirmation(title, message, action) {
    const modal = document.getElementById('modal-confirm');

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;

    // Cambiar el botón aceptar a rojo para acciones destructivas
    const acceptBtn = document.getElementById('modal-accept');
    acceptBtn.className = 'px-5 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition font-medium';

    modal.classList.remove('hidden');

    const cancelBtn = document.getElementById('modal-cancel');

    const closeModal = () => modal.classList.add('hidden');

    cancelBtn.onclick = closeModal;
    acceptBtn.onclick = () => {
        closeModal();
        action();
    };

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}