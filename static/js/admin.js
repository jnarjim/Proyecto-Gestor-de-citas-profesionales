function adminPanel() {
    return {
        solicitudes: [],
        mensaje: '',
        token: localStorage.getItem('access_token'),

        init() {
            if (!this.token) {
                window.location.href = '/login/';
                return;
            }
            this.cargarSolicitudes();
        },

        cargarSolicitudes() {
            fetch('/usuarios/solicitudes-pendientes/', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            })
            .then(res => res.json())
            .then(data => this.solicitudes = data)
            .catch(err => console.error(err));
        },

        gestionSolicitud(id, estado) {
            fetch(`/usuarios/gestion-solicitud/${id}/`, {
                method: 'PUT',
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
                this.cargarSolicitudes(); // actualizar lista
            })
            .catch(err => {
                console.error(err);
                this.mensaje = 'Ocurrió un error';
            });
        }
    }
}