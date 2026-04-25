import { checkRole } from "./pageRole.js";
import { Logout } from "./logout.js";

checkRole?.();

const Router = (() => {

    const PAGE_MAP = {
        user: "../../pages/admin/pages/manageUser.html",
        stock: "../../pages/admin/pages/manageStock.html",
        request: "../../pages/admin/pages/manageRequest.html",
        nft: "../../pages/admin/pages/manageNFT.html",
        logout: "../../pages/admin/pages/logout.html",
    };

    const PAGE_INIT = {
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
            pageName = "user";
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
        navigate("user");
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