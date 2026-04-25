import { Users } from "./api.js";

function init() {
    const btn = document.getElementById("btnChangeRole");

    if (!btn || btn.dataset.bound) return;

    btn.dataset.bound = "true";

    btn.addEventListener("click", () => {
        const role = Users.toggleRole();

        localStorage.setItem("role", role);
        console.log("Current role:", role);
        if (role === "seller") {
            window.location.href = "/seller";
        } else if (role === "customer") {
            window.location.href = "/customer";
        }
    });
}

export const Role = {
    init
};