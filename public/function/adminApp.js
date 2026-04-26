import { checkRole } from "./pageRole.js";
import { Logout } from "./logout.js";
import { ManageUsers } from "./adminUser.js";
import { ManageStocks } from "./adminStock.js";
import { ManageRequests } from "./adminRequest.js";

checkRole?.();

const Router = (() => {

    const PAGE_MAP = {
        user: "../../pages/admin/pages/manageUser.html",
        stock: "../../pages/admin/pages/manageStock.html",
        request: "../../pages/admin/pages/manageRequest.html",
        logout: "../../pages/admin/pages/logout.html",
    };

    const PAGE_INIT = {
        user: () => ManageUsers.init(),
        stock: () => ManageStocks.init(),
        request: () => ManageRequests.init(),
        logout: () => Logout.init(),
    };

    const canvas = () => document.getElementById("canvasContent");

    async function navigate(page) {
        const res = await fetch(PAGE_MAP[page]);
        const html = await res.text();
        canvas().innerHTML = html;
        PAGE_INIT[page]?.();
    }

    function init() {
        document.addEventListener("click", e => {
            const el = e.target.closest("[data-page]");
            if (!el) return;
            e.preventDefault();
            navigate(el.dataset.page);
        });

        navigate("user");
    }

    return { init };
})();

document.addEventListener("DOMContentLoaded", Router.init);