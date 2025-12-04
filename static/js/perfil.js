document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("perfil-form");
    const spinner = document.getElementById("perfil-spinner");

    const token = localStorage.getItem("access");
    if (!token) {
        window.location.href = "/login/";
        return;
    }

    // ----------------------------
    // CARGAR DATOS DEL PERFIL
    // ----------------------------
    async function cargarPerfil() {
        spinner.classList.remove("hidden");

        try {
            const res = await fetch("/api/usuarios/me/", {
                headers: { "Authorization": "Bearer " + token }
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error("Error cargando perfil");
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

        try {
            const res = await fetch("/api/usuarios/me/", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success("Perfil actualizado");
            } else {
                toast.error(result.detail || "Error al guardar cambios");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error de conexión");
        }
    });
});