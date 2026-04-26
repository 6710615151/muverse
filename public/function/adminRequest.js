import { Requests } from "./api.js";

export const ManageRequests = (() => {
    let _all = [];

    const render = () => {
        const list = document.getElementById('req-list');
        if (!list) return;

        list.innerHTML = _all.map(r => `
            <tr>
                <td style="padding:10px 16px">${r.request_id}</td>
                <td style="padding:10px 16px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.request_title}</td>
                <td style="padding:10px 16px;opacity:0.7">${r.customer_id?.slice(0,8) ?? '—'}…</td>
                <td style="padding:10px 16px;opacity:0.85">${r.service_type_name ?? '—'}</td>
                <td style="padding:10px 16px">฿${Number(r.budget).toLocaleString()}</td>
                <td style="padding:10px 16px">${r.request_status}</td>
                <td style="padding:10px 16px;text-align:center">
                    <button data-id="${r.request_id}" class="del">🗑</button>
                </td>
            </tr>
        `).join('');

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
