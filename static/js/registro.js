document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registro-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            first_name: form.first_name.value,
            last_name: form.last_name.value,
            email: form.email.value,
            password: form.password.value,
        };

        try {
            const res = await fetch("/api/usuarios/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(result.message || "Usuario registrado correctamente");
                setTimeout(() => (window.location.href = "/login/"), 1500);
            } else {
                toast.error(result.message || result.detail || "Error en registro");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error de conexión");
        }
    });
});