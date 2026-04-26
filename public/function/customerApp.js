
import { Booking } from "./booking.js";
import { Market, Shop } from "./market.js";
import { Orders } from "./orders.js";
import { Role } from "./changeRole.js";
import { checkRole } from "./pageRole.js";
import { WalletFlow } from "./wallet.js";
import { Logout } from "./logout.js";

checkRole?.();

const Router = (() => {

    const PAGE_MAP = {
        market: "../../pages/customer/pages/market.html",
        shop: "../../pages/customer/pages/shop.html",
        booking: "../../pages/customer/pages/booking.html",
        orders: "../../pages/customer/pages/orders.html",
        wallet: "../../pages/customer/pages/wallet.html",
        user: "../../pages/customer/pages/user.html",
        nft: "../../pages/customer/pages/nft.html",
        logout: "../../pages/customer/pages/logout.html",
    };

    const PAGE_INIT = {
        market: () => Market.init(),
        shop: () => Shop.init(),
        booking: () => Booking.init(),
        orders: () => Orders.init(),
        wallet: () => WalletFlow.init(),
        nft: () => console.log("init nft"),
        user: () => requestAnimationFrame(() => Role?.init()),
        logout: () => requestAnimationFrame(() => Logout.init()),
    };

    const cache = {};
    const MAX_CACHE = 5;

    const getCanvas = () => document.getElementById("canvasContent");
    const getLoader = () => document.getElementById("canvasLoader");

    function transitionOut() {
        const canvas = getCanvas();
        if (!canvas) return Promise.resolve();

        return new Promise(resolve => {
            canvas.style.transition = "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
            canvas.style.opacity = "0";
            canvas.style.transform = "translateY(20px) scale(0.98)";
            canvas.style.filter = "blur(6px)";

            setTimeout(resolve, 300);
        });
    }

    function transitionIn() {
        const canvas = getCanvas();
        if (!canvas) return;

        canvas.style.transition = "none";
        canvas.style.opacity = "0";
        canvas.style.transform = "translateY(20px) scale(0.98)";
        canvas.style.filter = "blur(6px)";

        requestAnimationFrame(() => {
            canvas.style.transition = "all 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
            canvas.style.opacity = "1";
            canvas.style.transform = "translateY(0) scale(1)";
            canvas.style.filter = "blur(0)";
        });
    }

    async function navigate(pageName) {

        if (!PAGE_MAP[pageName]) {
            console.warn("Page not found → fallback to market");
            pageName = "market";
        }

        setActiveNav(pageName);
        showLoader();

        try {
          
            await transitionOut();

            const html = await loadPage(pageName);

            render(html);

          
            transitionIn();

            PAGE_INIT[pageName]?.();

            window.scrollTo({ top: 0, behavior: "smooth" });

            console.log(`→ ${pageName}`);

        } catch (err) {
            handleError(err);
        } finally {
            hideLoader();
        }
    }


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
        navigate("market");
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

document.addEventListener("click", e => {
    const el = e.target.closest("[data-link]");
    if (!el) return;

    window.open(el.dataset.link, "_blank", "noopener,noreferrer");
});