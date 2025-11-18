document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initPage, 100); // Espera a que auth.js cargue
});

async function cargarCitas() {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
        const res = await fetch("/api/citas/mis-citas/", {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (res.status === 401) {
            const refreshed = await refreshToken();
            if (refreshed) return cargarCitas();
            return;
        }

        const citas = await res.json();
        const ul = document.getElementById("citas-list");
        ul.innerHTML = "";

        const hoy = new Date().toISOString().split("T")[0];
        const proximas = citas.filter(c => c.fecha >= hoy).slice(0, 5);

        if (proximas.length === 0) {
            ul.innerHTML = "<li>No tienes próximas citas.</li>";
        } else {
            proximas.forEach(cita => {
                const li = document.createElement("li");
                li.textContent = `${cita.fecha} a las ${cita.hora} con ${
                    cita.profesional
                        ? cita.profesional.first_name
                        : cita.cliente.first_name
                }`;
                ul.appendChild(li);
            });
        }

        document
            .getElementById("proximas-citas-container")
            .classList.remove("hidden");

    } catch (err) {
        console.error(err);
    }
}

async function initPage() {
    if (typeof getProfile !== "function") {
        console.error("auth.js no está cargado");
        return setTimeout(initPage, 100);
    }

    const perfil = await getProfile();
    const accionesDiv = document.getElementById("acciones");

    // Si hay usuario logueado
    if (perfil) {
        document.getElementById("bienvenida").textContent =
            `Bienvenido, ${perfil.first_name}!`;

        accionesDiv.innerHTML = `
            <a href="/mis-citas/" class="block bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">
                Ver mis citas
            </a>
            <a href="/notificaciones/" class="block bg-green-600 text-white p-4 rounded text-center hover:bg-green-700">
                Ver notificaciones
            </a>
            ${!perfil.is_professional ? `
            <a href="/citas-disponibles/" class="block bg-purple-600 text-white p-4 rounded text-center hover:bg-purple-700">
                Ver citas disponibles
            </a>
            ` : ''}
        `;

        cargarCitas();
    }
    // Si NO hay usuario logueado
    else {
        document.getElementById("bienvenida").textContent =
            "Bienvenido a Gestor de Citas!";

        accionesDiv.innerHTML = `
            <a href="/login/" class="block bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">
                Login
            </a>
            <a href="/registro/" class="block bg-green-600 text-white p-4 rounded text-center hover:bg-green-700">
                Registro
            </a>
        `;
    }
}