import { Stock } from "./api.js";

export const ManageStocks = (() => {
    let _all = [];

    const render = () => {
        const list = document.getElementById('stock-list');
        if (!list) return;

        list.innerHTML = _all.map(s => `
            <tr>
                <td style="padding:10px 16px">
                    ${s.url ? `<img src="${s.url}" style="width:48px;height:48px;object-fit:cover;border-radius:6px" onerror="this.style.display='none'">` : '—'}
                </td>
                <td style="padding:10px 16px">${s.item_name}</td>
                <td style="padding:10px 16px;opacity:0.7">${s.shop_name ?? '—'}</td>
                <td style="padding:10px 16px">฿${Number(s.price).toLocaleString()}</td>
                <td style="padding:10px 16px">${s.stock_quantity}</td>
                <td style="padding:10px 16px">${s.stock_status}</td>
                <td style="padding:10px 16px;text-align:center">
                    <button data-id="${s.stock_id}" class="del">🗑</button>
                </td>
            </tr>
        `).join('');

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
