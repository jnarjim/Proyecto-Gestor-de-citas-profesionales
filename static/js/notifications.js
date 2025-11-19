// notifications.js - Sistema de notificaciones y toast

// ============================================
// SISTEMA DE TOAST (Notificaciones visuales)
// ============================================

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación: 'success', 'error', 'info', 'warning'
 */
function showToast(message, type = 'success') {
    if (!message) {
        console.error('showToast: No se proporcionó un mensaje');
        return;
    }

    const event = new CustomEvent('toast', {
        detail: { message, type }
    });
    window.dispatchEvent(event);
}

/**
 * Atajos para diferentes tipos de notificaciones toast
 */
const toast = {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    info: (message) => showToast(message, 'info'),
    warning: (message) => showToast(message, 'warning')
};

// Hacer disponible globalmente
window.showToast = showToast;
window.toast = toast;

// ============================================
// API DE NOTIFICACIONES
// ============================================

// Obtener notificaciones del usuario
async function getNotifications() {
    const token = localStorage.getItem('access');
    try {
        const response = await fetch('/api/notificaciones/', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) throw new Error('Error al cargar notificaciones');
        return await response.json();
    } catch (error) {
        console.error(error);
        toast.error('Error al cargar notificaciones');
        return [];
    }
}

// Marcar notificación como leída
async function markAsRead(notifId) {
    const token = localStorage.getItem('access');
    try {
        const response = await fetch(`/api/notificaciones/${notifId}/marcar-leida/`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (response.ok) {
            toast.success('Notificación marcada como leída');
            return true;
        }
    } catch (error) {
        console.error(error);
        toast.error('Error al marcar como leída');
        return false;
    }
}

/**
 * Verificar notificaciones no leídas y actualizar badge
 */
async function checkNotifications() {
    const token = localStorage.getItem('access');
    if (!token) return;

    try {
        const notifications = await getNotifications();
        const unreadCount = notifications.filter(n => !n.leida).length;

        // Actualizar contador en el menú si existe
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Error al verificar notificaciones:', error);
    }
}

// Inicializar verificación de notificaciones
document.addEventListener('DOMContentLoaded', () => {
    // Verificación inicial
    checkNotifications();

    // Verificación periódica cada 30 segundos
    setInterval(checkNotifications, 30000);
});

// Exportar funciones globalmente
window.getNotifications = getNotifications;
window.markAsRead = markAsRead;
window.checkNotifications = checkNotifications;

console.log('✅ Sistema de notificaciones y toast cargado correctamente');