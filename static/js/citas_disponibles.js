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

        citas.forEach(cita => {
            const card = document.createElement("div");
            card.className = `
                bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between cursor-pointer
                hover:bg-blue-50 transition transform hover:-translate-y-1 hover:shadow-xl
            `;

            const profesionalNombre = cita.profesional
                ? `${cita.profesional.first_name} ${cita.profesional.last_name}`.trim()
                : "No disponible";

            card.innerHTML = `
                <p class="font-semibold text-gray-800 mb-2">Profesional: ${profesionalNombre}</p>
                <p class="text-gray-600 mb-1">Fecha: ${cita.fecha}</p>
                <p class="text-gray-600">Hora: ${cita.hora}</p>
            `;

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