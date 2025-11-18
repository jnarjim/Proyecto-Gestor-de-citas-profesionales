document.addEventListener("DOMContentLoaded", async () => {
    const perfil = await window.getProfile();
    if (!perfil) return (window.location.href = "/login/");

    if (!perfil.is_professional) {
        document.getElementById("crear-cita-form").innerHTML =
            "<p class='text-red-500 text-center'>Solo los profesionales pueden crear citas.</p>";
        return;
    }

    // ⏱ Establecer fecha mínima = hoy
    const hoy = new Date().toISOString().split("T")[0];
    document.getElementById("fecha").setAttribute("min", hoy);

    const fechaInput = document.getElementById("fecha");
    const horaSelect = document.getElementById("hora");

    fechaInput.addEventListener("change", async () => {
        const fecha = fechaInput.value;
        if (!fecha) return;

        horaSelect.innerHTML = "<option>Cargando horas...</option>";

        const token = localStorage.getItem("access");

        // Obtener citas del profesional para ese día
        const res = await fetch(`/api/citas/mis/?fecha=${fecha}`, {
            headers: { Authorization: "Bearer " + token },
        });

        const citas = res.ok ? await res.json() : [];

        // Generar horarios disponibles (09:00 a 18:00 cada 30 min)
        const horarios = generarHorarios();

        // Quitar horas ocupadas
        const ocupadas = citas.map(c => c.hora);

        const disponibles = horarios.filter(h => !ocupadas.includes(h));

        // Si es hoy, quitar horas ya pasadas
        if (fecha === hoy) {
            const ahora = new Date();
            disponibles = disponibles.filter(h => {
                const [hh, mm] = h.split(":").map(Number);
                const fechaHora = new Date();
                fechaHora.setHours(hh, mm, 0);

                return fechaHora > ahora;
            });
        }

        // Renderizar
        if (disponibles.length === 0) {
            horaSelect.innerHTML =
                "<option disabled>No quedan horas disponibles</option>";
            return;
        }

        horaSelect.innerHTML = `<option value="">Selecciona una hora</option>`;
        disponibles.forEach(h => {
            horaSelect.innerHTML += `<option value="${h}">${h}</option>`;
        });
    });

    // Función auxiliar para generar horarios
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

    // Enviar formulario
    const form = document.getElementById("crear-cita-form");
    form.addEventListener("submit", async e => {
        e.preventDefault();

        const fecha = fechaInput.value;
        const hora = horaSelect.value;
        const token = localStorage.getItem("access");

        const res = await fetch("/api/citas/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ fecha, hora }),
        });

        const data = await res.json();
        const mensaje = document.getElementById("mensaje-cita");

        if (res.ok) {
            mensaje.classList.remove("text-red-500");
            mensaje.classList.add("text-green-500");
            mensaje.innerText = "Cita creada correctamente";

            setTimeout(() => {
                window.location.href = "/mis-citas/";
            }, 1200);
        } else {
            mensaje.innerText = data.detail || "Error al crear cita";
        }
    });
});