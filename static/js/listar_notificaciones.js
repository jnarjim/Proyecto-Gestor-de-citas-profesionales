document.addEventListener("DOMContentLoaded", cargarNotificaciones);

async function cargarNotificaciones() {
    const contenedor = document.getElementById("lista-notificaciones");
    contenedor.innerHTML = "<p class='text-gray-500 text-center'>Cargando...</p>";

    const notificaciones = await window.getNotifications();

    if (notificaciones.length === 0) {
        contenedor.innerHTML = `
            <p class="text-gray-500 text-center">No tienes notificaciones.</p>
        `;
        return;
    }

    contenedor.innerHTML = "";

    notificaciones.forEach(n => {
        const item = document.createElement("div");
        item.className =
            "p-4 border-b flex justify-between items-center hover:bg-gray-50 cursor-pointer";

        let destino = "/";
        if (n.cita) destino = `/cita/${n.cita}/`;

        item.innerHTML = `
            <div>
                <p class="${n.leido ? 'text-gray-600' : 'font-bold text-blue-700'}">
                    ${n.mensaje}
                </p>
                <p class="text-sm text-gray-400">
                    ${new Date(n.creada_en).toLocaleString()}
                </p>
            </div>
            ${!n.leido ? `<span class="text-xs bg-blue-500 text-white px-2 py-1 rounded">Nuevo</span>` : ""}
        `;

        // Click → Ir al destino
        item.addEventListener("click", () => {
            window.location.href = destino;
        });

        // Si no está leída, marcar al abrir
        if (!n.leido) {
            window.markAsRead(n.id);
        }

        contenedor.appendChild(item);
    });
}