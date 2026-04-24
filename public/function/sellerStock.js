// ===============================
// IMPORTS
// ===============================
import { Booking } from "./booking.js";
import { Market, Shop } from "./market.js";
import { Role } from "./changeRole.js";
import { checkRole } from "./pageRole.js";
import { WalletFlow } from "./wallet.js";

checkRole?.();
 
// ===============================
// APP INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    initLogoutModal();
    Router.init();

    console.log(
        "%cRouter working",
        "color:#c9a84c;font-size:13px;font-weight:bold"
    );
});

function logout() {
    localStorage.clear();
    window.location.replace("/Auth");
}

// ===============================
// LOGOUT MODAL
// ===============================
function initLogoutModal() {
    const modal = document.getElementById("logoutModal");
    const logoutBtn = document.getElementById("logoutBtn");
    const cancelBtn = document.getElementById("cancelLogout");
    const confirmBtn = document.getElementById("confirmLogout");

    logoutBtn?.addEventListener("click", () => {
        modal?.classList.add("flex");
    });

    cancelBtn?.addEventListener("click", () => {
        modal?.classList.remove("flex");
    });

    confirmBtn?.addEventListener("click", () => {
        logout();
    });
}


// ===============================
// ROUTER (SPA CORE)
// ===============================
const Router = (() => {

    // ---------- CONFIG ----------
    const PAGE_MAP = {
        market: "../../pages/customer/pages/market.html",
        shop: "../../pages/customer/pages/shop.html",
        booking: "../../pages/customer/pages/booking.html",
        wallet: "../../pages/customer/pages/wallet.html",
        user: "../../pages/customer/pages/user.html",
        nft: "../../pages/customer/pages/nft.html",
        logout: "../../pages/customer/pages/logout.html",
    };

    const PAGE_INIT = {
        
        market: () => Market.init(),
        
        shop: () => Shop.init(),

        booking: () => Booking.init(),

        nft: () => console.log("init nft"),

        wallet: () => WalletFlow.init(),

        user: () => {
          Role?.init();
        }


    };

    const cache = {};

   
    const getCanvas = () => document.getElementById("canvasContent");
    const getLoader = () => document.getElementById("canvasLoader");


    // ===============================
    // NAVIGATE
    // ===============================
    async function navigate(pageName) {
        if (!PAGE_MAP[pageName]) return;

        setActiveNav(pageName);
        showLoader();
        animateOut();

        try {
            const html = await loadPage(pageName);

            render(html);
            bindLinks();
            PAGE_INIT[pageName]?.();

            window.scrollTo(0, 0);

            console.log("Navigated to:", pageName);

        } catch (err) {
            handleError(err);
        }

        hideLoader();
        animateIn();
    }


    async function loadPage(pageName) {
        if (cache[pageName]) return cache[pageName];

        const res = await fetch(PAGE_MAP[pageName]);
        if (!res.ok) throw new Error(`Failed to load ${pageName}`);

        const html = await res.text();
        cache[pageName] = html;

        return html;
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

    function bindLinks(root = document) {
        root.querySelectorAll("[data-page]").forEach(el => {
            if (el.dataset.bound) return;

            el.dataset.bound = "true";

            el.addEventListener("click", e => {
                e.preventDefault();
                navigate(el.dataset.page);
            });
        });
    }

    function handleError(err) {
        console.error("[Router]", err);

        const canvas = getCanvas();
        if (!canvas) return;

        canvas.innerHTML = `
            <div style="padding:80px;text-align:center;color:gray">
                <p style="font-size:20px">โหลดหน้าไม่สำเร็จ</p>
                <p>ไอ้หนุ่มอย่าหลอน</p>
            </div>
        `;
    }

    function init() {
        bindLinks(document.getElementById("mainNav"));
        navigate("market");
    }

    function clearCache(page) {
        if (page) delete cache[page];
        else Object.keys(cache).forEach(k => delete cache[k]);
    }

    return {
        init,
        navigate,
        clearCache
    };

})();