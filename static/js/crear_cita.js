// crear_cita.js - Crear nuevas citas con estilo uniforme
document.addEventListener("DOMContentLoaded", init);

async function init() {
    // Esperar que auth.js esté cargado
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
        document.getElementById("crear-cita-container").innerHTML =
            `<div class="text-center text-red-500 font-semibold py-8">
                Solo los profesionales pueden crear citas.
            </div>`;
        return;
    }

    setupForm();
}

function setupForm() {
    const fechaInput = document.getElementById("fecha");
    const horaSelect = document.getElementById("hora");
    const mensajeDiv = document.getElementById("mensaje-cita");
    const btn = document.getElementById("crear-btn");

    // Fecha mínima = hoy
    const hoy = new Date().toISOString().split("T")[0];
    fechaInput.setAttribute("min", hoy);

    fechaInput.addEventListener("change", async () => {
        const fecha = fechaInput.value;
        if (!fecha) return;

        horaSelect.innerHTML = `<option disabled>🔄 Cargando horas...</option>`;

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

            if (horarios.length === 0) {
                horaSelect.innerHTML = `<option disabled>No quedan horas disponibles</option>`;
                return;
            }

            horaSelect.innerHTML = `<option value="">Selecciona una hora</option>`;
            horarios.forEach(h => {
                horaSelect.innerHTML += `<option value="${h}">${h}</option>`;
            });

            mensajeDiv.innerHTML = ""; // Limpiar mensaje
        } catch (err) {
            console.error("Error cargando horas:", err);
            mensajeDiv.innerHTML = `<span class="text-red-500 font-semibold">❌ No se pudieron cargar los horarios</span>`;
            horaSelect.innerHTML = "<option disabled>Error al cargar horas</option>";
        }
    });

    // Enviar formulario
    const form = document.getElementById("crear-cita-form");
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const fecha = fechaInput.value;
        const hora = horaSelect.value;
        const token = localStorage.getItem("access");

        if (!fecha || !hora) {
            mensajeDiv.innerHTML = `<span class="text-red-500 font-semibold">Selecciona fecha y hora</span>`;
            return;
        }

        btn.disabled = true;
        btn.innerHTML = `<span class="animate-pulse">Creando…</span>`;

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
                toast.success("✅ Cita creada correctamente");
                btn.innerHTML = "Creada ✔";
                setTimeout(() => window.location.href = "/mis-citas/", 1200);
            } else {
                mensajeDiv.innerHTML = `<span class="text-red-500 font-semibold">❌ ${data.detail || "Error al crear cita"}</span>`;
                btn.innerHTML = "Crear Cita";
            }
        } catch (err) {
            console.error("Error creando cita:", err);
            mensajeDiv.innerHTML = `<span class="text-red-500 font-semibold">Error de conexión</span>`;
            btn.innerHTML = "Crear Cita";
        } finally {
            btn.disabled = false;
        }
    });
}

// Generar horarios de 09:00 a 18:00 cada 30 min
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