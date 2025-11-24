document.addEventListener("DOMContentLoaded", init);

async function init() {
    let attempts = 0;
    while (typeof window.getProfile !== "function" && attempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    if (typeof window.getProfile !== "function") {
        toast.error('Error al cargar dependencias');
        return;
    }

    const perfil = await window.getProfile();
    if (!perfil) {
        toast.error('Debes iniciar sesión para crear citas');
        setTimeout(() => window.location.href = '/login/', 2000);
        return;
    }

    if (!perfil.is_professional) {
        document.getElementById("crear-cita-container").innerHTML = `
            <div class="text-center py-12">
                <svg class="w-20 h-20 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Acceso Restringido</h3>
                <p class="text-gray-600 mb-6">Solo los profesionales pueden crear citas.</p>
                <a href="/mis-citas/" class="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Volver a mis citas
                </a>
            </div>
        `;
        return;
    }

    setupForm();
}

function setupForm() {
    const fechaInput = document.getElementById("fecha");
    const horaSelect = document.getElementById("hora");
    const mensajeDiv = document.getElementById("mensaje-cita");
    const btn = document.getElementById("crear-btn");

    const hoy = new Date().toISOString().split("T")[0];
    fechaInput.setAttribute("min", hoy);

    fechaInput.addEventListener("change", async () => {
        const fecha = fechaInput.value;
        if (!fecha) return;

        // Loading state
        horaSelect.innerHTML = `
            <option disabled selected>
                <svg class="animate-spin inline h-4 w-4" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                </svg>
                Cargando horarios disponibles...
            </option>
        `;
        horaSelect.disabled = true;
        mensajeDiv.innerHTML = '';

        try {
            const token = localStorage.getItem("access");
            const res = await fetch(`/api/citas/mis/?fecha=${fecha}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                toast.error('Sesión expirada');
                setTimeout(() => window.location.href = '/login/', 2000);
                return;
            }

            const citas = res.ok ? await res.json() : [];
            let horarios = generarHorarios();
            const ocupadas = citas.map(c => c.hora);
            horarios = horarios.filter(h => !ocupadas.includes(h));

            if (fecha === hoy) {
                const ahora = new Date();
                horarios = horarios.filter(h => {
                    const [hh, mm] = h.split(":").map(Number);
                    const fechaHora = new Date();
                    fechaHora.setHours(hh, mm, 0);
                    return fechaHora > ahora;
                });
            }

            horaSelect.disabled = false;

            if (horarios.length === 0) {
                horaSelect.innerHTML = `<option value="" disabled selected>No hay horarios disponibles para esta fecha</option>`;
                mensajeDiv.innerHTML = `
                    <div class="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-4">
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <p class="text-sm text-yellow-800">No quedan horarios disponibles para la fecha seleccionada. Por favor, selecciona otra fecha.</p>
                        </div>
                    </div>
                `;
                return;
            }

            horaSelect.innerHTML = `<option value="">Selecciona una hora</option>`;
            horarios.forEach(h => {
                const option = document.createElement('option');
                option.value = h;
                option.textContent = h;
                horaSelect.appendChild(option);
            });

            mensajeDiv.innerHTML = `
                <div class="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm text-green-800">Se encontraron <strong>${horarios.length}</strong> horarios disponibles.</p>
                    </div>
                </div>
            `;

        } catch (err) {
            console.error("Error cargando horas:", err);
            horaSelect.disabled = false;
            horaSelect.innerHTML = `<option value="" disabled selected>Error al cargar horarios</option>`;
            mensajeDiv.innerHTML = `
                <div class="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm text-red-800">No se pudieron cargar los horarios. Por favor, intenta nuevamente.</p>
                    </div>
                </div>
            `;
        }
    });

    const form = document.getElementById("crear-cita-form");
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const fecha = fechaInput.value;
        const hora = horaSelect.value;
        const token = localStorage.getItem("access");

        if (!fecha || !hora) {
            mensajeDiv.innerHTML = `
                <div class="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm text-red-800">Por favor, selecciona una fecha y hora válidas.</p>
                    </div>
                </div>
            `;
            return;
        }

        btn.disabled = true;
        btn.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creando cita...
        `;

        try {
            const res = await fetch("/api/citas/crear/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({ fecha, hora }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Cita creada correctamente");
                btn.innerHTML = `
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    ¡Cita creada!
                `;
                btn.className = "w-full bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-lg flex items-center justify-center";
                setTimeout(() => window.location.href = "/mis-citas/", 1200);
            } else {
                mensajeDiv.innerHTML = `
                    <div class="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p class="text-sm text-red-800">${data.detail || "Error al crear la cita"}</p>
                        </div>
                    </div>
                `;
                btn.innerHTML = `
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Crear Cita
                `;
            }
        } catch (err) {
            console.error("Error creando cita:", err);
            mensajeDiv.innerHTML = `
                <div class="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm text-red-800">Error de conexión. Por favor, intenta nuevamente.</p>
                    </div>
                </div>
            `;
            btn.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Crear Cita
            `;
        } finally {
            btn.disabled = false;
        }
    });
}

function generarHorarios() {
    const horas = [];
    let h = 9;
    let m = 0;
    while (h < 18) {
        const hh = h.toString().padStart(2, "0");
        const mm = m.toString().padStart(2, "0");
        horas.push(`${hh}:${mm}`);
        m += 30;
        if (m === 60) {
            m = 0;
            h++;
        }
    }
    return horas;
}