document.addEventListener("DOMContentLoaded", init);

async function cargarCitasDisponibles() {
    const token = localStorage.getItem('access');
    if (!token) return;

    try {
        const res = await fetch('/api/citas/disponibles/', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (res.status === 401) {
            const refreshed = await window.refreshToken();
            if (refreshed) return cargarCitasDisponibles();
            return;
        }

        const citas = await res.json();
        const container = document.getElementById('citas-disponibles');
        container.innerHTML = ''; // vaciar contenedor

        if (citas.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No hay citas disponibles.</p>';
            return;
        }

        citas.forEach(cita => {
            const card = document.createElement('div');
            card.className = "bg-white p-4 rounded shadow flex flex-col justify-between";

            const profesionalNombre = cita.profesional
                ? `${cita.profesional.first_name} ${cita.profesional.last_name}`
                : 'No disponible';

            card.innerHTML = `
                <p><strong>Profesional:</strong> ${profesionalNombre}</p>
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
                <button class="mt-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        onclick="reservarCita(${cita.id})">
                    Reservar
                </button>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error cargando citas disponibles:", err);
        const container = document.getElementById('citas-disponibles');
        container.innerHTML = '<p class="col-span-full text-center text-red-500">Error al cargar citas.</p>';
    }
}

async function reservarCita(citaId) {
    const token = localStorage.getItem('access');
    try {
        const res = await fetch(`/api/citas/${citaId}/reservar/`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        alert(data.detail || 'Acción completada');
        if (res.ok) cargarCitasDisponibles();  // refrescar lista
    } catch (err) {
        console.error('Error al reservar:', err);
        alert('Error al reservar la cita.');
    }
}

async function init() {
    if (!window.getProfile) {
        setTimeout(init, 100);
        return;
    }

    const perfil = await window.getProfile();
    if (!perfil || perfil.is_professional) {
        window.location.href = '/login/';
        return;
    }

    cargarCitasDisponibles();
}