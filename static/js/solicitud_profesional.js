function solicitudProfesional() {
    return {
        aceptaReapertura: false,
        solicitud: null,
        mensaje: '',
        error: '',

        init() {
            this.cargarSolicitud();
        },

        async cargarSolicitud() {
            try {
                const res = await fetch('/api/usuarios/solicitud-profesional/mia/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    }
                });

                if (!res.ok) {
                    this.solicitud = null;
                    return;
                }

                const data = await res.json();
                this.solicitud = data;

            } catch (err) {
                console.error(err);
                this.error = 'Error al cargar tu solicitud.';
            }
        },

        async enviarSolicitud() {
            this.mensaje = '';
            this.error = '';

            try {
                const res = await fetch('/api/usuarios/solicitud-profesional/crear/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access')}`
                    },
                    body: JSON.stringify({
                        acepta_reapertura_citas: this.aceptaReapertura
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    if (typeof data === 'object') {
                        this.error = data.detail || Object.values(data)[0];
                    } else {
                        this.error = 'Error al enviar la solicitud.';
                    }
                    return;
                }

                this.mensaje = 'Solicitud enviada correctamente.';
                this.solicitud = data;

            } catch (err) {
                console.error(err);
                this.error = 'Error al enviar la solicitud.';
            }
        }
    }
}