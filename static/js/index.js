document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initPage, 100);
});

async function cargarCitas() {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
        const res = await fetch("/api/citas/mis-citas/", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (res.status === 401) {
            const refreshed = await window.refreshToken();
            if (refreshed) return cargarCitas();
            toast.error("Sesión expirada. Por favor inicia sesión.");
            return;
        }

        const citas = await res.json();
        const ul = document.getElementById("citas-list");
        ul.innerHTML = "";

        const hoy = new Date().toISOString().split("T")[0];

        const proximas = citas
            .filter(c => c.fecha >= hoy && (c.estado === "pendiente" || c.estado === "confirmada"))
            .slice(0, 5);

        if (proximas.length === 0) {
            ul.innerHTML = `
                <li class="text-center py-8 text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p class="text-lg">No tienes próximas citas</p>
                </li>
            `;
        } else {
            proximas.forEach(cita => {
                const estadoColor = cita.estado === "confirmada" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
                const estadoTexto = cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);

                const li = document.createElement("li");
                li.className = "border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg hover:bg-gray-100 transition";
                li.innerHTML = `
                    <a href="/cita/${cita.id}/" class="block">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <div class="flex items-center mb-2">
                                    <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <span class="font-semibold text-gray-800">${cita.fecha}</span>
                                    <span class="mx-2 text-gray-400">•</span>
                                    <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span class="text-gray-700">${cita.hora}</span>
                                </div>
                                <div class="flex items-center text-gray-600">
                                    <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                    <span>Con ${cita.profesional ? cita.profesional.first_name : cita.cliente.first_name}</span>
                                </div>
                            </div>
                            <span class="${estadoColor} px-3 py-1 rounded-full text-sm font-medium">
                                ${estadoTexto}
                            </span>
                        </div>
                    </a>
                `;
                ul.appendChild(li);
            });
        }

        document.getElementById("proximas-citas-container").classList.remove("hidden");

    } catch (err) {
        console.error(err);
        toast.error("Error al cargar próximas citas.");
    }
}

async function cargarResumenProfesional() {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
        const res = await fetch("/api/citas/panel/", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (res.ok) {
            const data = await res.json();
            document.getElementById("count-citas-hoy").textContent = data.citas_hoy;
            document.getElementById("count-pendientes").textContent = data.pendientes;
            document.getElementById("count-completadas").textContent = data.completadas;
            document.getElementById("resumen-profesional").classList.remove("hidden");
        }

    } catch (err) {
        console.error("Error cargando resumen profesional:", err);
    }
}

async function initPage() {
    if (typeof window.getProfile !== "function") {
        console.error("auth.js no cargado aún");
        return setTimeout(initPage, 100);
    }

    const perfil = await window.getProfile();
    const accionesDiv = document.getElementById("acciones");
    const explicacionDiv = document.getElementById("explicacion");
    const contenidoLogueado = document.getElementById("contenido-logueado");
    const subtitulo = document.getElementById("subtitulo");

    if (perfil) {
        // Usuario logueado
        document.getElementById("bienvenida").textContent = `¡Hola, ${perfil.first_name}!`;
        subtitulo.textContent = "Aquí tienes un resumen de tu actividad";

        explicacionDiv.classList.add("hidden");
        contenidoLogueado.classList.remove("hidden");

        // Acciones rápidas con diseño mejorado
        const acciones = [
            {
                href: "/mis-citas/",
                icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>`,
                text: "Ver mis citas",
                color: "blue"
            },
            {
                href: "/notificaciones/",
                icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>`,
                text: "Notificaciones",
                color: "green"
            }
        ];

        if (!perfil.is_professional) {
            acciones.push({
                href: "/citas-disponibles/",
                icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>`,
                text: "Citas disponibles",
                color: "purple"
            });
        }

        accionesDiv.innerHTML = acciones.map(accion => `
            <a href="${accion.href}" class="flex items-center p-4 bg-${accion.color}-50 border-2 border-${accion.color}-200 rounded-lg hover:bg-${accion.color}-100 hover:border-${accion.color}-300 transition transform hover:-translate-y-1 hover:shadow-lg">
                <div class="bg-${accion.color}-600 text-white p-3 rounded-lg mr-4">
                    ${accion.icon}
                </div>
                <span class="text-${accion.color}-900 font-semibold text-lg">${accion.text}</span>
            </a>
        `).join('');

        // Panel profesional
        if (perfil.is_professional) {
            const btnPanel = document.createElement('a');
            btnPanel.href = '/panel-profesional/';
            btnPanel.className = 'flex items-center p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition transform hover:-translate-y-1 hover:shadow-lg';
            btnPanel.innerHTML = `
                <div class="bg-indigo-600 text-white p-3 rounded-lg mr-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <span class="text-indigo-900 font-semibold text-lg">Panel Profesional</span>
            `;
            accionesDiv.appendChild(btnPanel);

            cargarResumenProfesional();
        }

        cargarCitas();

    } else {
        // Usuario no logueado
        document.getElementById("bienvenida").textContent = "¡Bienvenido a Gestor de Citas!";
        subtitulo.textContent = "Gestiona tus citas de forma profesional";
        explicacionDiv.classList.remove("hidden");
        contenidoLogueado.classList.add("hidden");
    }
}