document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registro-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            first_name: form.first_name.value,
            last_name: form.last_name.value,
            email: form.email.value,
            password: form.password.value
        };

        try {
            const response = await fetch("/api/usuarios/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            const msgDiv = document.getElementById("registro-mensaje");

            if (response.ok) {
                msgDiv.classList.remove("text-red-500");
                msgDiv.classList.add("text-green-500");
                msgDiv.innerText = result.message || "Usuario registrado correctamente";

                // Redirigir al login
                setTimeout(() => {
                    window.location.href = "/login/";
                }, 1500);

            } else {
                msgDiv.innerText = result.message || result.detail || "Error en registro";
            }

        } catch (err) {
            document.getElementById("registro-mensaje").innerText = "Error de conexión";
            console.error(err);
        }
    });
});