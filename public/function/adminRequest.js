import { Requests, serviceType } from "./api.js";

export const ManageRequests = (() => {
    let _all = [];
    let _svt = [];

    const renderServiceTypes = () => {
        const list = document.getElementById('svt-list');
        if (!list) return;
        if (!_svt.length) {
            list.innerHTML = '<span class="mgr-empty" style="padding:0;font-size:0.8rem">No service types yet.</span>';
            return;
        }
        list.innerHTML = _svt.map(t => `
            <span class="mgr-cat-tag">
                ${t.name}
                <button class="mgr-cat-del-btn" data-id="${t.service_type_id}" title="Remove">&#x2715;</button>
            </span>
        `).join('');

        list.querySelectorAll('.mgr-cat-del-btn').forEach(btn =>
            btn.onclick = async () => {
                try {
                    await serviceType.deleteServiceType(btn.dataset.id);
                    _svt = _svt.filter(t => t.service_type_id != btn.dataset.id);
                    renderServiceTypes();
                } catch (e) {
                    alert('Delete failed: ' + e.message);
                }
            });
    };

    const initServiceTypeUI = () => {
        const input = document.getElementById('svt-input');
        const addBtn = document.getElementById('svt-add-btn');
        if (!input || !addBtn) return;

        const doAdd = async () => {
            const val = input.value.trim();
            if (!val) return;
            try {
                const created = await serviceType.createServiceType({ name: val });
                _svt.push(created);
                _svt.sort((a, b) => a.name.localeCompare(b.name));
                input.value = '';
                renderServiceTypes();
            } catch (e) {
                alert('Create failed: ' + e.message);
            }
        };

        addBtn.onclick = doAdd;
        input.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });
    };

    const STATUS_CLASS = {
        pending:   'mgr-badge-pending',
        accepted:  'mgr-badge-accepted',
        rejected:  'mgr-badge-rejected',
        done:      'mgr-badge-done',
        completed: 'mgr-badge-completed',
    };

    const render = () => {
        const list = document.getElementById('req-list');
        if (!list) return;

        if (!_all.length) {
            list.innerHTML = `<p class="mgr-empty">No requests found</p>`;
            return;
        }

        list.innerHTML = _all.map(r => {
            const statusKey = (r.request_status || '').toLowerCase();
            const statusClass = STATUS_CLASS[statusKey] || '';
            const initial = (r.request_title || 'R')[0].toUpperCase();
            return `
            <div class="mgr-card">
                <div class="mgr-card__avatar">${initial}</div>
                <div class="mgr-card__info">
                    <div class="mgr-card__name">${r.request_title}</div>
                    <div class="mgr-card__sub">Customer: ${r.customer_id?.slice(0,8) ?? '—'}… · ${r.service_type_name ?? '—'}</div>
                    <div class="mgr-card__meta">#${r.request_id}</div>
                </div>
                <div class="mgr-card__right">
                    <div class="mgr-card__price">฿${Number(r.budget).toLocaleString()}</div>
                    <span class="mgr-badge ${statusClass}">${r.request_status}</span>
                    <button data-id="${r.request_id}" class="mgr-btn del" style="color:#dc2626" title="Delete">
                        <span class="fi fi-ts-trash"></span>
                    </button>
                </div>
            </div>
        `}).join('');

        list.querySelectorAll('.del').forEach(btn =>
            btn.onclick = async () => {
                await Requests.deleteRequest(btn.dataset.id);
                _all = _all.filter(x => x.request_id != btn.dataset.id);
                render();
            });
    };

    return {
        init: async () => {
            [_all, _svt] = await Promise.all([Requests.getRequests(), serviceType.getAllServiceType()]);
            render();
            renderServiceTypes();
            initServiceTypeUI();
        }
    };
})();
