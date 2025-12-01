function adminPanel() {
    return {
        solicitudes: [],
        mensaje: '',
        token: localStorage.getItem('access'),

        init() {
            if (!this.token) {
                window.location.href = '/login/';
                return;
            }

            // Decodificar JWT para verificar rol
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            if (!payload.is_staff && !payload.is_superuser) {
                window.location.href = '/'; // no es admin
                return;
            }

            this.cargarSolicitudes();
        },

        cargarSolicitudes() {
            fetch('/api/usuarios/solicitud-profesional/pendientes/', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            })
            .then(res => res.json())
            .then(data => this.solicitudes = data)
            .catch(err => console.error("Error cargando solicitudes:", err));
        },

        gestionSolicitud(id, estado) {
            fetch(`/api/usuarios/solicitud-profesional/gestionar/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ estado })
            })
            .then(res => {
                if (!res.ok) throw new Error('Error al actualizar solicitud');
                return res.json();
            })
            .then(data => {
                this.mensaje = `Solicitud ${estado}`;
                this.cargarSolicitudes();
            })
            .catch(err => {
                console.error(err);
                this.mensaje = 'Ocurrió un error';
            });
        }
    }
}