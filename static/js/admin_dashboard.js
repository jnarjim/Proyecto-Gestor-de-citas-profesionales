// admin_dashboard.js - Lógica del panel de administración

function adminDashboard() {
    return {
        solicitudes: [],
        stats: {
            totalUsuarios: 0,
            profesionales: 0,
            totalCitas: 0
        },
        token: localStorage.getItem('access'),

        init() {
            if (!this.token) {
                window.location.href = '/login/';
                return;
            }

            // Verificar que es admin
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            if (!payload.is_staff && !payload.is_superuser) {
                window.location.href = '/';
                return;
            }

            this.cargarDatos();
        },

        async cargarDatos() {
            await this.cargarSolicitudes();
            await this.cargarEstadisticas();
        },

        async cargarSolicitudes() {
            try {
                const res = await fetch('/api/usuarios/solicitud-profesional/pendientes/', {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        // Token expirado, intentar refrescar
                        const refreshed = await window.refreshToken();
                        if (refreshed) {
                            this.token = localStorage.getItem('access');
                            return this.cargarSolicitudes();
                        } else {
                            window.location.href = '/login/';
                            return;
                        }
                    }
                    throw new Error('Error al cargar solicitudes');
                }

                this.solicitudes = await res.json();
            } catch (err) {
                console.error("Error cargando solicitudes:", err);
                window.showToast('Error al cargar solicitudes', 'error');
            }
        },

        async cargarEstadisticas() {
            try {

                const res = await fetch('/api/usuarios/admin/stats/', {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });

                if (res.ok) {
                    this.stats = await res.json();
                }

            } catch (err) {
                console.error("Error cargando estadísticas:", err);
            }
        },

        async gestionSolicitud(id, estado) {
            try {
                const res = await fetch(`/api/usuarios/solicitud-profesional/gestionar/${id}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify({ estado })
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        // Token expirado
                        const refreshed = await window.refreshToken();
                        if (refreshed) {
                            this.token = localStorage.getItem('access');
                            return this.gestionSolicitud(id, estado);
                        }
                    }
                    throw new Error('Error al actualizar solicitud');
                }

                // Mostrar toast de éxito
                const mensaje = estado === 'aprobada'
                    ? 'Solicitud aprobada exitosamente'
                    : 'Solicitud rechazada';

                window.showToast(mensaje, 'success');

                // Recargar datos
                await this.cargarDatos();

            } catch (err) {
                console.error(err);
                window.showToast('Ocurrió un error al procesar la solicitud', 'error');
            }
        },

        formatDate(dateString) {
            if (!dateString) return 'N/A';

            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (err) {
                console.error('Error formateando fecha:', err);
                return dateString;
            }
        }
    }
}