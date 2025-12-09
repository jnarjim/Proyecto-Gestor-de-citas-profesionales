document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("perfil-form");
    const spinner = document.getElementById("perfil-spinner");
    const saveButton = form.querySelector("button[type='submit']");

    let token = localStorage.getItem("access");
    if (!token) {
        window.location.href = "/login/";
        return;
    }

    // ----------------------------
    // Función para refrescar token
    // ----------------------------
    async function refreshToken() {
        if (typeof window.refreshToken === "function") {
            const refreshed = await window.refreshToken();
            if (refreshed) {
                token = localStorage.getItem("access");
                return true;
            }
        }
        return false;
    }

    // ----------------------------
    // CARGAR DATOS DEL PERFIL
    // ----------------------------
    async function cargarPerfil() {
        spinner.classList.remove("hidden");

        try {
            let res = await fetch("/api/usuarios/me/", {
                headers: { "Authorization": "Bearer " + token }
            });

            // Si token expiró, intentar refrescar
            if (res.status === 401) {
                const refreshed = await refreshToken();
                if (refreshed) return cargarPerfil();
                window.location.href = "/login/";
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.detail || "Error cargando perfil");
                return;
            }

            // Mostrar datos en inputs
            document.getElementById("first_name").value = data.first_name;
            document.getElementById("last_name").value = data.last_name;
            document.getElementById("email").value = data.email;
            document.getElementById("phone").value = data.phone || "";
            document.getElementById("bio").value = data.bio || "";

            spinner.classList.add("hidden");
            form.classList.remove("hidden");

        } catch (err) {
            console.error(err);
            toast.error("Error de conexión");
        }
    }

    cargarPerfil();

    // ----------------------------
    // VALIDACIÓN BÁSICA
    // ----------------------------
    function validarDatos(data) {
        if (!data.first_name.trim() || !data.last_name.trim()) {
            toast.error("Nombre y apellidos no pueden estar vacíos");
            return false;
        }
        return true;
    }

    // ----------------------------
    // GUARDAR CAMBIOS
    // ----------------------------
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            first_name: document.getElementById("first_name").value,
            last_name: document.getElementById("last_name").value,
            phone: document.getElementById("phone").value,
            bio: document.getElementById("bio").value,
        };

        if (!validarDatos(data)) return;

        saveButton.disabled = true;
        saveButton.textContent = "Guardando...";

        try {
            let res = await fetch("/api/usuarios/me/", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                },
                body: JSON.stringify(data),
            });

            // Si token expiró, intentar refrescar
            if (res.status === 401) {
                const refreshed = await refreshToken();
                if (refreshed) return form.dispatchEvent(new Event("submit"));
                window.location.href = "/login/";
                return;
            }

            const result = await res.json().catch(() => ({}));

            if (res.ok) {
                toast.success("Perfil actualizado");
            } else {
                toast.error(result.detail || "Error al guardar cambios");
            }

        } catch (err) {
            console.error(err);
            toast.error("Error de conexión");
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Guardar Cambios";
        }
    });
});