// appointments.js

// Obtener citas disponibles globales
async function getAvailableAppointments() {
    const token = localStorage.getItem('access');
    try {
        const response = await fetch('/api/citas/disponibles/', {
            headers: token ? { 'Authorization': 'Bearer ' + token } : {}
        });
        if (!response.ok) throw new Error('Error al cargar citas');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Reservar cita
async function reserveAppointment(citaId) {
    const token = localStorage.getItem('access');
    try {
        const response = await fetch(`/api/citas/${citaId}/reservar/`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await response.json();
        if (response.ok) {
            alert('Cita reservada correctamente');
        } else {
            alert('Error: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error(error);
    }
}