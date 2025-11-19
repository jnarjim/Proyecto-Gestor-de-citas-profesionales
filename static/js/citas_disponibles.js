// citas_disponibles.js - Mostrar citas disponibles para clientes
document.addEventListener("DOMContentLoaded", init);

async function init() {
    // Esperar que auth.js esté cargado
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

    // Solo clientes pueden acceder
    if (!perfil || perfil.is_professional) {
        toast.error("Acceso no autorizado");
        setTimeout(() => window.location.href = "/login/", 1500);
        return;
    }

    cargarCitasDisponibles();
}

async function cargarCitasDisponibles() {
    const token = localStorage.getItem("access");
    if (!token) return;

    const container = document.getElementById("citas-disponibles");
    container.innerHTML = '<p class="col-span-full text-center text-gray-500">Cargando citas...</p>';

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
            container.innerHTML =
                '<p class="col-span-full text-center text-gray-500">No hay citas disponibles.</p>';
            return;
        }

        citas.forEach((cita) => {
            const card = document.createElement("div");
            card.className =
                "bg-white p-4 rounded shadow flex flex-col justify-between";

            const profesionalNombre = cita.profesional
                ? `${cita.profesional.first_name} ${cita.profesional.last_name}`.trim()
                : "No disponible";

            card.innerHTML = `
                <p><strong>Profesional:</strong> ${profesionalNombre}</p>
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
            `;

            // Click en card abre detalle_cita
            card.classList.add("cursor-pointer", "hover:bg-gray-50", "transition");
            card.addEventListener("click", () => {
                window.location.href = `/cita/${cita.id}/`;
            });

            container.appendChild(card);
        });
    } catch (err) {
        console.error("Error cargando citas disponibles:", err);
        container.innerHTML =
            '<p class="col-span-full text-center text-red-500">Error al cargar citas.</p>';
        toast.error("No se pudieron cargar las citas disponibles");
    }
}