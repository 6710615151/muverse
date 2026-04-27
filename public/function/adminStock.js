import { Stock, Category } from "./api.js";

export const ManageStocks = (() => {
    let _all = [];
    let _cats = [];

    const renderCategories = () => {
        const list = document.getElementById('cat-list');
        if (!list) return;
        if (!_cats.length) {
            list.innerHTML = '<span class="mgr-empty" style="padding:0;font-size:0.8rem">No categories yet.</span>';
            return;
        }
        list.innerHTML = _cats.map(c => `
            <span class="mgr-cat-tag">
                ${c.name}
                <button class="mgr-cat-del-btn" data-id="${c.category_id}" title="Remove">&#x2715;</button>
            </span>
        `).join('');

        list.querySelectorAll('.mgr-cat-del-btn').forEach(btn =>
            btn.onclick = async () => {
                try {
                    await Category.delete(btn.dataset.id);
                    _cats = _cats.filter(c => c.category_id != btn.dataset.id);
                    renderCategories();
                } catch (e) {
                    alert('Delete failed: ' + e.message);
                }
            });
    };

    const initCategoryUI = () => {
        const input = document.getElementById('cat-input');
        const addBtn = document.querySelector('.mgr-cat-add-btn');
        if (!input || !addBtn) return;

        const doAdd = async () => {
            const val = input.value.trim();
            if (!val) return;
            try {
                const created = await Category.create(val);
                _cats.push(created);
                _cats.sort((a, b) => a.name.localeCompare(b.name));
                input.value = '';
                renderCategories();
            } catch (e) {
                alert('Create failed: ' + e.message);
            }
        };

        addBtn.onclick = doAdd;
        input.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });
    };

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
            [_all, _cats] = await Promise.all([Stock.getAll(), Category.getAll()]);
            render();
            renderCategories();
            initCategoryUI();
        }
    };
})();
