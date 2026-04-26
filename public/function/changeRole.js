import { Users } from "./api.js";
import { seller } from "./api.js";

function init() {
    const btn = document.getElementById("btnChangeRole");

    if (!btn || btn.dataset.bound) return;

    btn.dataset.bound = "true";

    btn.addEventListener("click", async () => {
        try {
            const id = localStorage.getItem('user_id');
            console.log(id);

            const data = await Users.toggleRole(id);
            console.log(data);
            const role = data.role;

            localStorage.setItem("role", role);
            console.log("Current role:", role);

            if (role === "seller") {
                const isSeller = await seller.existsByUserId(id);
                if (isSeller) {
                    window.location.href = "/seller";
                } else {
                    window.location.href = "/shop-name";
                }
            } else if (role === "customer") {
                window.location.href = "/customer";
            }

        } catch (err) {
            console.error("Toggle role error:", err);
        }
    });
}

export const Role = { init };