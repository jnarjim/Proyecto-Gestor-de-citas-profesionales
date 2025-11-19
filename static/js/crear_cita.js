// crear_cita.js - Crear nuevas citas
document.addEventListener("DOMContentLoaded", init);

async function init() {
    // Esperar que auth.js esté cargado
    let attempts = 0;
    while (typeof window.getProfile !== "function" && attempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    if (typeof window.getProfile !== "function") {
        console.error('auth.js no cargó correctamente');
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
        document.getElementById("crear-cita-form").innerHTML =
            "<p class='text-red-500 text-center'>Solo los profesionales pueden crear citas.</p>";
        return;
    }

    setupForm();
}

function setupForm() {
    const fechaInput = document.getElementById("fecha");
    const horaSelect = document.getElementById("hora");
    const mensajeDiv = document.getElementById("mensaje-cita");

    // Fecha mínima = hoy
    const hoy = new Date().toISOString().split("T")[0];
    fechaInput.setAttribute("min", hoy);

    // Al cambiar la fecha, actualizar horas disponibles
    fechaInput.addEventListener("change", async () => {
        const fecha = fechaInput.value;
        if (!fecha) return;

        horaSelect.innerHTML = "<option>Cargando horas...</option>";

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
                horaSelect.innerHTML = "<option disabled>No quedan horas disponibles</option>";
                return;
            }

            horaSelect.innerHTML = `<option value="">Selecciona una hora</option>`;
            horarios.forEach(h => {
                horaSelect.innerHTML += `<option value="${h}">${h}</option>`;
            });

        } catch (err) {
            console.error("Error cargando horas:", err);
            toast.error("No se pudieron cargar los horarios disponibles");
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
            toast.error("Selecciona fecha y hora");
            return;
        }

        const btn = document.getElementById("crear-btn");
        btn.disabled = true;
        btn.innerText = "Creando...";

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
                setTimeout(() => window.location.href = "/mis-citas/", 1200);
            } else {
                toast.error(data.detail || "Error al crear cita");
            }
        } catch (err) {
            console.error("Error creando cita:", err);
            toast.error("Error de conexión al crear la cita");
        } finally {
            btn.disabled = false;
            btn.innerText = "Crear Cita";
        }
    });
}

// Generar horarios disponibles de 09:00 a 18:00 cada 30 min
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