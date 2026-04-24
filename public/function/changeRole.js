
import { Users } from "./api.js";
import { pageRole } from "./pageRole.js";

function init() {
    const btn = document.getElementById("btnChangeRole");

    if (!btn || btn.dataset.bound) return;

    btn.dataset.bound = "true";

    btn.addEventListener("click", () => {
        const role = Users.toggleRole();

        localStorage.setItem("role", role);
        console.log("Current role:", role);

        pageRole();
    });
}

export const Role = {
    init
};