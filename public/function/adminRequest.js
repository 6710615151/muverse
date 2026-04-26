import { Requests } from "./api.js";

export const ManageRequests = (() => {
    let _all = [];

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
            _all = await Requests.getRequests();
            render();
        }
    };
})();
