import { Booking } from "./booking.js";

const Router = (() => {

    const State = {
        currentPage: null,
        user: null,
        token: null
    };//หลอกยังไม่ได้ทำ

    const PAGE_MAP = {
        market: '../../pages/customer/pages/market.html',
        booking: '../../pages/customer/pages/booking.html',
        wallet: '../../pages/customer/pages/wallet.html',
        user: '../../pages/customer/pages/user.html',
    };

    const _canvas = () => document.getElementById('canvasContent');
    const _loader = () => document.getElementById('canvasLoader');

    const _cache = {};

    //แก้ตรงนี้
    const PAGE_INIT = {
        market: () => {
            console.log('init market');
            
        },
        booking: () => {
            Booking.init();
        },
        wallet: () => {
            console.log('init wallet');
        },
        user: () => {
            console.log('init user');
        }
    };

    async function navigate(pageName) {
        if (!PAGE_MAP[pageName]) return;

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

            State.currentPage = pageName;
            console.log('Current Page:', State.currentPage);

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
        navigate('market');
    }

    return { init, navigate, bindLinks, State };

})();


document.addEventListener('DOMContentLoaded', () => {
    Router.init();
    console.log('%cRouter working', 'color:#c9a84c;font-size:13px;font-weight:bold');
});