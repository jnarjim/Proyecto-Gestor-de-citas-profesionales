// listar_citas.js

document.addEventListener("DOMContentLoaded", init);

async function cargarMisCitas() {
    const token = localStorage.getItem('access');
    if (!token) return;

    try {
        let res = await fetch('/api/citas/mis-citas/', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        // Intentar refrescar token si expira
        if (res.status === 401) {
            const refreshed = await window.refreshToken();
            if (refreshed) return cargarMisCitas();
            return;
        }

        const citas = await res.json();
        const ul = document.getElementById('mis-citas-list');
        ul.innerHTML = '';

        if (citas.length === 0) {
            ul.innerHTML = '<li>No tienes citas.</li>';
            return;
        }

        citas.forEach(cita => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="/cita/${cita.id}/" class="text-blue-600 hover:underline">
                    ${cita.fecha} a las ${cita.hora}
                    con ${cita.profesional ? cita.profesional.first_name : cita.cliente.first_name}
                    – Estado: ${cita.estado}
                </a>
            `;
            ul.appendChild(li);
        });

    } catch (err) {
        console.error("Error cargando citas:", err);
    }
}

async function init() {
    // Esperar a que auth.js esté cargado
    if (typeof window.getProfile !== 'function') {
        console.warn("auth.js no está listo aún");
        setTimeout(init, 100);
        return;
    }

    const perfil = await window.getProfile();
    if (!perfil) {
        window.location.href = '/login/';
        return;
    }

    // MOSTRAR BOTÓN SOLO SI ES PROFESIONAL
    if (perfil.is_professional) {
        document.getElementById("btn-crear-cita").innerHTML = `
            <a href="/crear-cita/"
                class="block bg-green-600 text-white p-2 rounded mb-4 text-center hover:bg-green-700">
                ➕ Crear nueva cita
            </a>
        `;
    }

    cargarMisCitas();
}