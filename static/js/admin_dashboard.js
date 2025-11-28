function adminSolicitudes() {
    return {
        solicitudes: [],

        init() {
            this.cargarSolicitudes();
        },

        cargarSolicitudes() {
            fetch('/api/usuarios/solicitudes/pendientes/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            })
            .then(res => res.json())
            .then(data => this.solicitudes = data)
        },

        aprobar(id) {
            this.actualizarSolicitud(id, 'aprobada');
        },

        rechazar(id) {
            this.actualizarSolicitud(id, 'rechazada');
        },

        actualizarSolicitud(id, estado) {
            fetch(`/api/usuarios/solicitudes/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado })
            })
            .then(res => {
                if(res.ok) this.cargarSolicitudes();
            })
        }
    }
}