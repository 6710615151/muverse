import { Booking } from "./booking.js";
import { Market, Shop } from "./market.js";
import { checkRole } from "./pageRole.js";
import { WalletFlow } from "./wallet.js";


checkRole("customer");

const Router = (() => {

    const PAGE_MAP = {
        //customer
        market: '../../pages/customer/pages/market.html',
        shop: '../../pages/customer/pages/shop.html',
        booking: '../../pages/customer/pages/booking.html',
        wallet: '../../pages/customer/pages/wallet.html',
        user: '../../pages/customer/pages/user.html',
        nft: '../../pages/customer/pages/nft.html',
    };

    const _canvas = () => document.getElementById('canvasContent');
    const _loader = () => document.getElementById('canvasLoader');

    const _cache = {};

    const PAGE_INIT = {
        market: () => Market.init(),
        shop: () => Shop.init(),
        booking: () => Booking.init(),
        nft: () => Shop.init(),
        wallet: () => WalletFlow.init(),
        user: () => console.log('init user')
    };

    async function navigate(pageName) {
        if (!PAGE_MAP[pageName]) return;

        // active nav (ใช้ DOM เป็น source of truth)
        document.querySelectorAll('.nav__link').forEach(l => {
            l.classList.toggle('active', l.dataset.page === pageName);
        });

        const loader = _loader();
        const content = _canvas();

        if (loader) loader.style.display = 'flex';

        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(12px)';
        }

        try {
            let html = _cache[pageName];

            if (!html) {
                const res = await fetch(PAGE_MAP[pageName]);
                if (!res.ok) throw new Error(`Failed to load ${pageName}`);
                html = await res.text();
                _cache[pageName] = html;
            }

            if (content) content.innerHTML = html;

            window.scrollTo({ top: 0, behavior: 'smooth' });

            bindLinks(content);

            PAGE_INIT[pageName]?.();

            console.log('Navigated to:', pageName);

        } catch (err) {
            console.error('[Router]', err);

            if (content) {
                content.innerHTML = `
                <div style="padding:80px;text-align:center;color:gray">
                    <p style="font-size:20px">โหลดหน้าไม่สำเร็จ</p>
                    <p>ไอ้หนุ่มอย่าหลอน</p>
                </div>`;
            }
        }

        setTimeout(() => {
            if (loader) loader.style.display = 'none';

            if (content) {
                content.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }
        }, 80);
    }

    function bindLinks(root = document) {
        root?.querySelectorAll('[data-page]').forEach(el => {
            if (el.dataset.routerBound) return;

            el.dataset.routerBound = 'true';

            el.addEventListener('click', (e) => {
                e.preventDefault();
                navigate(el.dataset.page);
            });
        });
    }

    function init() {
        bindLinks(document.getElementById('mainNav'));
        navigate('market'); // default page
    }

    return { init, navigate, bindLinks };

})();

document.addEventListener('DOMContentLoaded', () => {
    Router.init();
    console.log('%cRouter working', 'color:#c9a84c;font-size:13px;font-weight:bold');
});