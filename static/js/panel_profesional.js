document.addEventListener("DOMContentLoaded", initPanel);

async function initPanel() {
    const token = localStorage.getItem('access');
    if (!token) {
        toast.error('Debes iniciar sesión');
        setTimeout(() => window.location.href = '/login/', 2000);
        return;
    }

    try {
        const res = await fetch('/api/citas/panel/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            const refreshed = await window.refreshToken?.();
            if (refreshed) {
                return initPanel();
            }
            toast.error('Sesión expirada');
            setTimeout(() => window.location.href = '/login/', 2000);
            return;
        }

        if (!res.ok) {
            throw new Error(`Error ${res.status} al cargar el panel`);
        }

        const data = await res.json();

        // Actualizar contadores con animación
        animateCounter('count-citas-hoy', data.citas_hoy);
        animateCounter('count-pendientes', data.pendientes);
        animateCounter('count-completadas', data.completadas);

        // Convertir citas a eventos de FullCalendar
        const detalles = data.detalles || [];

        const eventos = detalles.map(c => {
            const shortName = c.cliente?.first_name || "Libre";
            const estadoShort = c.estado.charAt(0).toUpperCase();

            // Asignar colores más específicos
            let color;
            switch(c.estado) {
                case 'pendiente':
                    color = '#F59E0B'; // Amber/Orange
                    break;
                case 'confirmada':
                    color = '#3B82F6'; // Blue
                    break;
                case 'completada':
                    color = '#10B981'; // Green
                    break;
                case 'cancelada':
                    color = '#EF4444'; // Red
                    break;
                default:
                    color = '#6B7280'; // Gray
            }

            return {
                id: c.id,
                title: `${shortName} (${estadoShort})`,
                start: `${c.fecha}T${c.hora}`,
                color: color,
                extendedProps: {
                    clienteNombre: shortName,
                    estado: c.estado,
                    citaId: c.id
                }
            };
        });

        // Inicializar FullCalendar con configuración mejorada
        const calendarEl = document.getElementById('calendario');
        const calendar = new FullCalendar.Calendar(calendarEl, {
            locale: 'es',
            initialView: 'timeGridWeek',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridDay,timeGridWeek,dayGridMonth'
            },
            buttonText: {
                today: 'Hoy',
                day: 'Día',
                week: 'Semana',
                month: 'Mes'
            },
            slotMinTime: '08:00:00',
            slotMaxTime: '20:00:00',
            allDaySlot: false,
            height: 'auto',
            events: eventos,
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
            },

            // Tooltip personalizado
            eventDidMount(info) {
                const estado = info.event.extendedProps.estado;
                const cliente = info.event.extendedProps.clienteNombre;
                const hora = info.event.start.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const estadoTexto = estado.charAt(0).toUpperCase() + estado.slice(1);

                info.el.setAttribute("title", `Cliente: ${cliente}\nEstado: ${estadoTexto}\nHora: ${hora}`);
                info.el.style.cursor = 'pointer';
            },

            // Click en evento - Modal mejorado
            eventClick(info) {
                const cliente = info.event.extendedProps.clienteNombre;
                const estado = info.event.extendedProps.estado;
                const citaId = info.event.extendedProps.citaId;
                const fecha = info.event.start.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const hora = info.event.start.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                showCitaModal(cliente, estado, fecha, hora, citaId);
            },

            // Estilos para días
            dayCellDidMount(info) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const cellDate = new Date(info.date);
                cellDate.setHours(0, 0, 0, 0);

                if (cellDate.getTime() === today.getTime()) {
                    info.el.style.backgroundColor = '#EEF2FF';
                }
            }
        });

        calendar.render();

    } catch(err) {
        console.error("Error cargando panel:", err);
        toast.error('Error al cargar el panel profesional');

        // Mostrar error en la página
        document.getElementById('calendario').innerHTML = `
            <div class="text-center py-16">
                <svg class="w-20 h-20 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-lg text-gray-600 mb-4">Error al cargar el calendario</p>
                <button onclick="location.reload()" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// Función para animar contadores
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const duration = 1000; // 1 segundo
    const steps = 30;
    const increment = targetValue / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            element.textContent = targetValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

// Modal mejorado para mostrar detalles de cita
function showCitaModal(cliente, estado, fecha, hora, citaId) {
    // Crear modal si no existe
    let modal = document.getElementById('cita-detail-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cita-detail-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        document.body.appendChild(modal);
    }

    const estadoInfo = getEstadoInfo(estado);

    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all">
            <div class="flex items-start justify-between mb-4">
                <h3 class="text-2xl font-bold text-gray-800">Detalles de Cita</h3>
                <button onclick="closeCitaModal()" class="text-gray-400 hover:text-gray-600 transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <div class="space-y-4">
                <!-- Cliente -->
                <div class="bg-blue-50 rounded-lg p-4">
                    <div class="flex items-center mb-2">
                        <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span class="text-sm font-medium text-blue-800">Cliente</span>
                    </div>
                    <p class="text-lg font-bold text-gray-800">${cliente}</p>
                </div>

                <!-- Fecha -->
                <div class="bg-purple-50 rounded-lg p-4">
                    <div class="flex items-center mb-2">
                        <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span class="text-sm font-medium text-purple-800">Fecha</span>
                    </div>
                    <p class="text-base font-semibold text-gray-800 capitalize">${fecha}</p>
                </div>

                <!-- Hora -->
                <div class="bg-orange-50 rounded-lg p-4">
                    <div class="flex items-center mb-2">
                        <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="text-sm font-medium text-orange-800">Hora</span>
                    </div>
                    <p class="text-lg font-bold text-gray-800">${hora}</p>
                </div>

                <!-- Estado -->
                <div class="flex justify-center">
                    <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${estadoInfo.class}">
                        ${estadoInfo.icon}
                        ${estadoInfo.text}
                    </span>
                </div>
            </div>

            <div class="mt-6 flex gap-3">
                <button onclick="closeCitaModal()" class="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-semibold">
                    Cerrar
                </button>
                <a href="/cita/${citaId}/" class="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition font-semibold text-center">
                    Ver Detalles
                </a>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    // Cerrar al hacer clic fuera
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeCitaModal();
        }
    };
}

function closeCitaModal() {
    const modal = document.getElementById('cita-detail-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function getEstadoInfo(estado) {
    const estados = {
        'pendiente': {
            text: 'Pendiente',
            class: 'bg-yellow-100 text-yellow-800',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        'confirmada': {
            text: 'Confirmada',
            class: 'bg-blue-100 text-blue-800',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        'completada': {
            text: 'Completada',
            class: 'bg-green-100 text-green-800',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>`
        },
        'cancelada': {
            text: 'Cancelada',
            class: 'bg-red-100 text-red-800',
            icon: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>`
        }
    };
    return estados[estado] || {
        text: estado,
        class: 'bg-gray-100 text-gray-800',
        icon: ''
    };
}