document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            email: form.email.value,
            password: form.password.value,
        };

        try {
            const res = await fetch("/api/usuarios/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok) {
                // Guardar tokens
                localStorage.setItem("access", result.access);
                localStorage.setItem("refresh", result.refresh);

                // Obtener perfil
                const perfilRes = await fetch("/api/usuarios/me/", {
                    headers: { "Authorization": "Bearer " + result.access },
                });

                const perfil = await perfilRes.json();
                if (perfilRes.ok) {
                    localStorage.setItem("user_first_name", perfil.first_name);
                    localStorage.setItem("is_professional", perfil.is_professional);
                }

                toast.success("Login exitoso");
                setTimeout(() => (window.location.href = "/"), 1200);
            } else {
                toast.error(result.detail || "Error en login");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error de conexión");
        }
    });
});