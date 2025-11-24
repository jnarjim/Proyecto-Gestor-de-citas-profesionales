document.addEventListener("DOMContentLoaded", init);

async function init() {
    let attempts = 0;
    while (typeof window.getProfile !== "function" && attempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    if (typeof window.getProfile !== "function") {
        toast.error("Error cargando dependencias");
        return;
    }

    const perfil = await window.getProfile();
    if (!perfil) {
        toast.error("Debes iniciar sesión");
        setTimeout(() => window.location.href = "/login/", 1500);
        return;
    }

    if (perfil.is_professional) {
        const container = document.getElementById("citas-disponibles");
        container.innerHTML = `
            <div class="col-span-full">
                <div class="bg-white rounded-2xl shadow-xl p-12 text-center">
                    <svg class="w-20 h-20 mx-auto mb-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Vista de Clientes</h3>
                    <p class="text-gray-600 mb-6">Esta sección es exclusiva para clientes que buscan reservar citas.</p>
                    <a href="/mis-citas/" class="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold shadow-md">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Ir a mis citas
                    </a>
                </div>
            </div>
        `;
        return;
    }

    cargarCitasDisponibles();
}

async function cargarCitasDisponibles() {
    const token = localStorage.getItem("access");
    if (!token) return;

    const container = document.getElementById("citas-disponibles");

    try {
        const res = await fetch("/api/citas/disponibles/", {
            headers: { Authorization: "Bearer " + token },
        });

        if (res.status === 401) {
            const refreshed = await window.refreshToken();
            if (refreshed) return cargarCitasDisponibles();
            toast.error("Sesión expirada");
            setTimeout(() => window.location.href = "/login/", 2000);
            return;
        }

        if (!res.ok) throw new Error(`Error ${res.status} al cargar citas`);

        const citas = await res.json();
        container.innerHTML = "";

        if (citas.length === 0) {
            container.innerHTML = `
                <div class="col-span-full">
                    <div class="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <svg class="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">No hay citas disponibles</h3>
                        <p class="text-gray-600 mb-6">No hay horarios disponibles en este momento. Por favor, vuelve más tarde.</p>
                        <a href="/" class="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold shadow-md">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            Volver al inicio
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        // Agrupar por profesional
        const citasPorProfesional = agruparPorProfesional(citas);

        citasPorProfesional.forEach(({ profesional, citas: citasProfesional }) => {
            const card = document.createElement("div");
            card.className = "bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1";

            const nombreCompleto = `${profesional.first_name} ${profesional.last_name || ''}`.trim();

            card.innerHTML = `
                <!-- Header del profesional -->
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                    <div class="flex items-center">
                        <div class="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold">${nombreCompleto}</h3>
                            <p class="text-purple-100 text-sm">${citasProfesional.length} citas disponibles</p>
                        </div>
                    </div>
                </div>

                <!-- Lista de citas -->
                <div class="p-6">
                    <div class="space-y-3" id="citas-profesional-${profesional.id}">
                        ${citasProfesional.slice(0, 3).map(cita => `
                            <div class="border-l-4 border-purple-500 bg-purple-50 rounded-r-lg p-4 hover:bg-purple-100 transition cursor-pointer cita-card" data-cita-id="${cita.id}">
                                <div class="flex items-center justify-between">
                                    <div class="flex-1">
                                        <div class="flex items-center mb-2">
                                            <svg class="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            <span class="text-sm font-semibold text-gray-800">${cita.fecha}</span>
                                        </div>
                                        <div class="flex items-center text-gray-600">
                                            <svg class="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <span class="text-sm font-medium">${cita.hora}</span>
                                        </div>
                                    </div>
                                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    ${citasProfesional.length > 3 ? `
                        <button class="mt-4 w-full text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center justify-center py-2 border border-purple-200 rounded-lg hover:bg-purple-50 transition" onclick="verMasCitas(${profesional.id})">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                            Ver ${citasProfesional.length - 3} más
                        </button>
                    ` : ''}
                </div>
            `;

            container.appendChild(card);

            // Agregar event listeners a las citas
            card.querySelectorAll('.cita-card').forEach(citaCard => {
                citaCard.addEventListener('click', () => {
                    const citaId = citaCard.dataset.citaId;
                    window.location.href = `/cita/${citaId}/`;
                });
            });

            // Guardar todas las citas para "ver más"
            card.dataset.todasCitas = JSON.stringify(citasProfesional);
        });

    } catch (err) {
        console.error("Error cargando citas disponibles:", err);
        container.innerHTML = `
            <div class="col-span-full">
                <div class="bg-white rounded-2xl shadow-xl p-12 text-center">
                    <svg class="w-20 h-20 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Error al cargar citas</h3>
                    <p class="text-gray-600 mb-6">Hubo un problema al cargar las citas disponibles.</p>
                    <button onclick="location.reload()" class="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold shadow-md">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Reintentar
                    </button>
                </div>
            </div>
        `;
        toast.error("No se pudieron cargar las citas disponibles");
    }
}

function agruparPorProfesional(citas) {
    const grupos = {};

    citas.forEach(cita => {
        const profId = cita.profesional?.id || 'sin-profesional';
        if (!grupos[profId]) {
            grupos[profId] = {
                profesional: cita.profesional || { id: 'sin-profesional', first_name: 'No', last_name: 'disponible' },
                citas: []
            };
        }
        grupos[profId].citas.push(cita);
    });

    // Ordenar citas por fecha y hora
    Object.values(grupos).forEach(grupo => {
        grupo.citas.sort((a, b) => {
            const dateA = new Date(`${a.fecha} ${a.hora}`);
            const dateB = new Date(`${b.fecha} ${b.hora}`);
            return dateA - dateB;
        });
    });

    return Object.values(grupos);
}

// Función global para "ver más"
window.verMasCitas = function(profesionalId) {
    // Esta función se puede expandir si quieres mostrar más citas en un modal
    // Por ahora solo redirige a una vista filtrada
    toast.info('Funcionalidad "Ver más" - próximamente');
}