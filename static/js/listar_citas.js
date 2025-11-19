// listar_citas.js - Gestión de la lista de citas
document.addEventListener("DOMContentLoaded", init);

/**
 * Manejar expiración de sesión
 */
function handleUnauthorized() {
    toast.error('Sesión expirada. Por favor, inicia sesión');
    setTimeout(() => window.location.href = '/login/', 2000);
}

/**
 * Obtener citas del usuario
 */
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
            ul.innerHTML = '<li class="py-4 text-center text-gray-500">No tienes citas.</li>';
            return;
        }

        citas.forEach(cita => {
            const li = document.createElement('li');
            li.className = 'py-4 flex justify-between items-center';

            const nombreProfesional = cita.profesional
                ? `${cita.profesional.first_name} ${cita.profesional.last_name || ''}`.trim()
                : 'No disponible';

            li.innerHTML = `
                <a href="/cita/${cita.id}/"
                   class="text-blue-600 hover:underline font-medium">
                   ${cita.fecha} a las ${cita.hora} – ${nombreProfesional} –
                   <span class="capitalize ${getEstadoClass(cita.estado)}">${cita.estado}</span>
                </a>
            `;
            ul.appendChild(li);
        });

    } catch (err) {
        console.error("Error cargando citas:", err);
        const ul = document.getElementById('mis-citas-list');
        ul.innerHTML = `<li class="py-4 text-center text-red-500">Error al cargar citas</li>`;
        toast.error('No se pudieron cargar las citas');
    }
}

/**
 * Devuelve clase Tailwind según estado
 */
function getEstadoClass(estado) {
    const estadoClasses = {
        'pendiente': 'text-yellow-600',
        'confirmada': 'text-blue-600',
        'completada': 'text-green-600',
        'cancelada': 'text-red-600'
    };
    return estadoClasses[estado] || 'text-gray-600';
}

/**
 * Inicializar la página
 */
async function init() {
    // Esperar que auth.js esté cargado
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
               class="inline-block bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition">
               ➕ Crear nueva cita
            </a>
        `;
    }

    // Cargar citas
    cargarMisCitas();
}