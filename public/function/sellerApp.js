// ===============================
// IMPORTS
// ===============================
import { checkRole } from "./pageRole.js";
import { WalletFlow } from "./wallet.js";
import { Logout } from "./logout.js";

// ===============================
// START CHECK ROLE
// ===============================
checkRole?.();

// ===============================
// ROUTER OBJECT
// ===============================
const Router = (() => {

    const PAGE_MAP = {
        stock: "../../pages/seller/pages/stock.html",
        accept: "../../pages/seller/pages/accept.html",
        wallet: "../../pages/seller/pages/wallet.html",
        user: "../../pages/seller/pages/user.html",
        logout: "../../pages/seller/pages/logout.html",
    };

    const PAGE_INIT = {
        wallet: () => WalletFlow.init(),
        user: () => requestAnimationFrame(() => Role?.init()),
        logout: () => requestAnimationFrame(() => Logout.init()),
    };

    const cache = {};
    const MAX_CACHE = 5;

    const getCanvas = () => document.getElementById("canvasContent");
    const getLoader = () => document.getElementById("canvasLoader");

    // ===============================
    // NAVIGATE
    // ===============================
    async function navigate(pageName) {

        if (!PAGE_MAP[pageName]) {
            console.warn("Page not found → fallback to market");
            pageName = "market";
        }

        setActiveNav(pageName);
        showLoader();
        animateOut();

        try {
            const html = await loadPage(pageName);

            render(html);

            PAGE_INIT[pageName]?.();

            window.scrollTo({ top: 0, behavior: "smooth" });

            console.log(`→ ${pageName}`);

        } catch (err) {
            handleError(err);
        } finally {
            animateIn();
            hideLoader();
        }
    }

    // ===============================
    // LOAD PAGE
    // ===============================
    async function loadPage(pageName) {
        if (cache[pageName]) return cache[pageName];

        const url = PAGE_MAP[pageName];
        console.log("LOADING:", url);

        const res = await fetch(url);

        if (!res.ok) {
            console.error("Failed URL:", url);
            throw new Error(`Failed to load ${pageName}`);
        }

        const html = await res.text();
        setCache(pageName, html);

        return html;
    }

    function setCache(key, value) {
        if (Object.keys(cache).length >= MAX_CACHE) {
            delete cache[Object.keys(cache)[0]];
        }
        cache[key] = value;
    }

    function render(html) {
        const canvas = getCanvas();
        if (canvas) canvas.innerHTML = html;
    }

    function setActiveNav(pageName) {
        document.querySelectorAll(".nav__link").forEach(link => {
            link.classList.toggle("active", link.dataset.page === pageName);
        });
    }

    function showLoader() {
        const loader = getLoader();
        if (loader) loader.style.display = "flex";
    }

    function hideLoader() {
        const loader = getLoader();
        if (loader) loader.style.display = "none";
    }

    function animateOut() {
        const canvas = getCanvas();
        if (!canvas) return;

        canvas.style.opacity = "0";
        canvas.style.transform = "translateY(12px)";
    }

    function animateIn() {
        const canvas = getCanvas();
        if (!canvas) return;

        requestAnimationFrame(() => {
            canvas.style.opacity = "1";
            canvas.style.transform = "translateY(0)";
        });
    }

    // ===============================
    // CLICK BIND
    // ===============================
    function bindLinks() {
        document.addEventListener("click", e => {
            const el = e.target.closest("[data-page]");

            if (!el) return;

            e.preventDefault();
            navigate(el.dataset.page);
        });
    }

    function handleError(err) {
        console.error("[Router]", err);

        const canvas = getCanvas();
        if (!canvas) return;

        canvas.innerHTML = `
            <div style="padding:80px;text-align:center;color:gray">
                <p style="font-size:20px">โหลดหน้าไม่สำเร็จ</p>
                <p>path ผิด หรือไฟล์ไม่มี</p>
            </div>
        `;
    }

    function init() {
        bindLinks();
        navigate("stock");
    }

    return {
        init,
        navigate
    };

})();
document.addEventListener("DOMContentLoaded", () => {
    Router.init();
});

window.Router = Router;