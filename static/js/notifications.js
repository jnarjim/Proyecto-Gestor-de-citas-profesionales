// notifications.js

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
            alert('Notificación marcada como leída');
        }
    } catch (error) {
        console.error(error);
    }
}