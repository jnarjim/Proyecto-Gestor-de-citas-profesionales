document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initPage, 100); // espera a que auth.js esté disponible
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

        // Mostrar solo citas futuras activas (pendiente o confirmada)
        const proximas = citas
            .filter(c => c.fecha >= hoy && (c.estado === "pendiente" || c.estado === "confirmada"))
            .slice(0, 5);

        if (proximas.length === 0) {
            ul.innerHTML = "<li>No tienes próximas citas.</li>";
        } else {
            proximas.forEach(cita => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <a href="/cita/${cita.id}/" class="text-blue-600 hover:underline">
                        ${cita.fecha} a las ${cita.hora} con ${
                            cita.profesional
                                ? cita.profesional.first_name
                                : cita.cliente.first_name
                        } – ${cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
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

async function initPage() {
    if (typeof window.getProfile !== "function") {
        console.error("auth.js no cargado aún");
        return setTimeout(initPage, 100);
    }

    const perfil = await window.getProfile();
    const accionesDiv = document.getElementById("acciones");

    if (perfil) {
        document.getElementById("bienvenida").textContent = `Bienvenido, ${perfil.first_name}!`;

        accionesDiv.innerHTML = `
            <a href="/mis-citas/" class="block bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700 transition">
                Ver mis citas
            </a>
            <a href="/notificaciones/" class="block bg-green-600 text-white p-4 rounded text-center hover:bg-green-700 transition">
                Ver notificaciones
            </a>
            ${!perfil.is_professional ? `
            <a href="/citas-disponibles/" class="block bg-purple-600 text-white p-4 rounded text-center hover:bg-purple-700 transition">
                Ver citas disponibles
            </a>
            ` : ''}
        `;

        cargarCitas();

    } else {
        document.getElementById("bienvenida").textContent = "Bienvenido a Gestor de Citas!";

        accionesDiv.innerHTML = `
            <a href="/login/" class="block bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700 transition">
                Login
            </a>
            <a href="/registro/" class="block bg-green-600 text-white p-4 rounded text-center hover:bg-green-700 transition">
                Registro
            </a>
        `;
    }
}