// notifications.js - Sistema de notificaciones y toast

// ============================================
// SISTEMA DE TOAST (Notificaciones visuales)
// ============================================

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

const toast = {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    info: (message) => showToast(message, 'info'),
    warning: (message) => showToast(message, 'warning')
};

window.showToast = showToast;
window.toast = toast;

// ============================================
// API DE NOTIFICACIONES
// ============================================

// Obtener notificaciones del usuario
async function getNotifications() {
    const token = localStorage.getItem('access');
    if (!token) return [];  // Retornar array vacío si no hay token

    try {
        const response = await fetch('/api/notificaciones/', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        // Si no está autenticado, retornar array vacío sin error
        if (response.status === 401 || response.status === 403) {
            return [];
        }

        if (!response.ok) throw new Error('Error al cargar notificaciones');
        return await response.json();
    } catch (error) {
        console.error('Error en getNotifications:', error);
        // NO mostrar toast de error si simplemente no hay usuario logueado
        return [];
    }
}

// Marcar notificación como leída
async function markAsRead(notifId) {
    const token = localStorage.getItem('access');
    if (!token) return false;

    try {
        const response = await fetch(`/api/notificaciones/${notifId}/marcar-leida/`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        return response.ok;
    } catch (error) {
        console.error('Error en markAsRead:', error);
        return false;
    }
}

// Eliminar notificación
async function deleteNotification(notifId) {
    const token = localStorage.getItem('access');
    if (!token) return false;

    try {
        const response = await fetch(`/api/notificaciones/${notifId}/eliminar/`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            const refreshed = await window.refreshToken?.();
            if (refreshed) return deleteNotification(notifId);
            throw new Error('Sesión expirada');
        }

        if (response.ok || response.status === 204) {
            return true;
        }
        throw new Error('Error al eliminar notificación');
    } catch (error) {
        console.error('Error en deleteNotification:', error);
        throw error; // Re-lanzar para que lo maneje el componente que llama
    }
}

// ============================================
// Verificar notificaciones y actualizar badge
// ============================================

async function checkNotifications() {
    const token = localStorage.getItem('access');
    if (!token) {
        // Ocultar badge si no hay token
        const badge = document.getElementById('notification-badge');
        if (badge) {
            badge.classList.add('hidden');
        }
        return;
    }

    try {
        const notifications = await getNotifications();
        const unreadCount = notifications.length;

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
        // Ocultar badge en caso de error
        const badge = document.getElementById('notification-badge');
        if (badge) {
            badge.classList.add('hidden');
        }
    }
}

// Inicializar verificación automática
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access');

    if (token) {
        // Solo si hay token, verificar notificaciones
        checkNotifications();
        setInterval(checkNotifications, 30000);
    } else {
        // Si no hay token, asegurarse de que el badge esté oculto
        const badge = document.getElementById('notification-badge');
        if (badge) {
            badge.classList.add('hidden');
        }
    }
});

// Exportar funciones globalmente
window.getNotifications = getNotifications;
window.markAsRead = markAsRead;
window.deleteNotification = deleteNotification;
window.checkNotifications = checkNotifications;

console.log('✅ Sistema de notificaciones y toast cargado correctamente');