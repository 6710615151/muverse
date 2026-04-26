import { Stock } from "./api.js";

export const ManageStocks = (() => {
    let _all = [];

    const STATUS_CLASS = {
        available:    'mgr-badge-available',
        out_of_stock: 'mgr-badge-out_of_stock',
        pending:      'mgr-badge-pending',
        banned:       'mgr-badge-banned',
    };

    const render = () => {
        const list = document.getElementById('stock-list');
        if (!list) return;

        if (!_all.length) {
            list.innerHTML = `<p class="mgr-empty">No stock items found</p>`;
            return;
        }

        list.innerHTML = _all.map(s => {
            const statusKey = (s.stock_status || '').toLowerCase();
            const statusClass = STATUS_CLASS[statusKey] || '';
            const imgEl = s.url
                ? `<img src="${s.url}" class="mgr-card__img" onerror="this.outerHTML='<div class=\\'mgr-card__img-ph\\'>📦</div>'">`
                : `<div class="mgr-card__img-ph">📦</div>`;
            return `
            <div class="mgr-card">
                ${imgEl}
                <div class="mgr-card__info">
                    <div class="mgr-card__name">${s.item_name}</div>
                    <div class="mgr-card__sub">${s.shop_name ?? '—'}</div>
                    <div class="mgr-card__meta">Stock: ${s.stock_quantity} units</div>
                </div>
                <div class="mgr-card__right">
                    <div class="mgr-card__price">฿${Number(s.price).toLocaleString()}</div>
                    <span class="mgr-badge ${statusClass}">${s.stock_status}</span>
                    <button data-id="${s.stock_id}" class="mgr-btn del" style="color:#dc2626" title="Delete">
                        <span class="fi fi-ts-trash"></span>
                    </button>
                </div>
            </div>
        `}).join('');

        list.querySelectorAll('.del').forEach(btn =>
            btn.onclick = async () => {
                await Stock.delete(btn.dataset.id);
                _all = _all.filter(x => x.stock_id != btn.dataset.id);
                render();
            });
    };

    return {
        init: async () => {
            _all = await Stock.getAll();
            render();
        }
    };
})();
