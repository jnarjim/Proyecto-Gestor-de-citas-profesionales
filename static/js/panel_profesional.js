document.addEventListener("DOMContentLoaded", initPanel);

async function initPanel() {
    const token = localStorage.getItem('access');
    if (!token) return;

    try {
        const res = await fetch('/api/citas/panel/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        // Actualizar contadores
        document.getElementById('count-citas-hoy').textContent = data.citas_hoy;
        document.getElementById('count-pendientes').textContent = data.pendientes;
        document.getElementById('count-completadas').textContent = data.completadas;

        // Convertir citas a eventos de FullCalendar
        const detalles = data.detalles || [];

        const eventos = detalles.map(c => {
            // Nombre visible en el calendario
            let shortName = c.cliente?.first_name
                ? c.cliente.first_name             // nombre completo
                : "Libre";                         // si no hay cliente

            // Estado abreviado (P, C, X...)
            let estadoShort = c.estado.charAt(0).toUpperCase();

            return {
                id: c.id,
                title: `${shortName} (${estadoShort})`,     // ejemplo: Maria (P) o Libre (P)
                fullTitle: `${shortName} – ${c.estado}`,    // ejemplo: Maria – pendiente
                start: `${c.fecha}T${c.hora}`,
                color: c.estado === 'pendiente' ? 'orange' :
                       c.estado === 'confirmada' ? 'blue' :
                       c.estado === 'completada' ? 'green' : 'red'
            };
        });

        // Inicializar FullCalendar
        const calendarEl = document.getElementById('calendario');
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridWeek',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridDay,timeGridWeek,dayGridMonth'
            },
            events: eventos,

            // Tooltip para mostrar el nombre completo
            eventDidMount(info) {
                info.el.setAttribute("title", info.event.extendedProps.fullTitle);
            },

            eventClick(info) {
                alert(
                    `Cliente: ${info.event.extendedProps.fullTitle}\n` +
                    `Fecha: ${info.event.start}`
                );
            }
        });

        calendar.render();

    } catch(err) {
        console.error("Error cargando panel:", err);
    }
}