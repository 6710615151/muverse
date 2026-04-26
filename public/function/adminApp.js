import { checkRole } from "./pageRole.js";
import { Logout } from "./logout.js";
import { Users, Wallet, Stock, Requests, serviceType, seller } from "./api.js";

checkRole?.();

const ManageUsers = {
    _cache: [],

    //เริ่ม
    init: async () => {
        await ManageUsers.loadUsers();
        document.getElementById('user-search')?.addEventListener('input', ManageUsers.onSearch);
    },

    //แสดงผู้ใช้
    loadUsers: async () => {
        const list = document.getElementById('user-list');
        if (!list) return;
        list.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;opacity:0.5">Loading...</td></tr>`;
        try {
            const users = await Users.getAll();
            ManageUsers._cache = users;
            ManageUsers.renderUsers(users);
        } catch (err) {
            list.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:40px">${err.message}</td></tr>`;
        }
    },

    //จัดเรียงผู้ใช้
    renderUsers: (users) => {
        const list = document.getElementById('user-list');
        if (!list) return;
        if (users.length === 0) {
            list.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;opacity:0.5">No users found.</td></tr>`;
            return;
        }
        list.innerHTML = users.map(u => `
            <tr data-user-id="${u.user_id}" data-name="${u.name}" data-email="${u.email}">
                <td style="padding:10px 20px 10px 16px">${u.user_id.slice(0, 8)}…</td>
                <td style="padding:10px 28px 10px 16px">${u.name}</td>
                <td style="padding:10px 28px 10px 16px">${u.email}</td>
                <td style="padding:10px 20px 10px 16px"><span class="role-badge role-badge--${u.role.toLowerCase()}">${u.role}</span></td>
                <td style="padding:10px 16px"><span style="color:${u.status === 'banned' ? '#f87171' : '#4ade80'};font-weight:600">${u.status ?? 'active'}</span></td>
                <td style="text-align:center;display:flex;gap:6px;justify-content:center">
                    <button class="btn-view" data-id="${u.user_id}">👁️</button>
                    <button class="btn-toggle" data-id="${u.user_id}" data-name="${u.name}" data-role="${u.role}">🔄</button>
                    <button class="btn-tx" data-id="${u.user_id}" data-name="${u.name}">📄</button>
                    ${u.role === 'seller' ? `<button class="btn-verify" data-id="${u.user_id}" data-name="${u.name}" title="Verify Seller">🛡️</button>` : ''}
                    <button class="btn-ban" data-id="${u.user_id}" data-name="${u.name}" data-status="${u.status}"
                        style="color:${u.status === 'banned' ? '#4ade80' : '#f87171'}">
                        ${u.status === 'banned' ? '✅' : '🚫'}
                    </button>
                    <button class="btn-delete" data-id="${u.user_id}" data-name="${u.name}">🗑</button>
                </td>
            </tr>
        `).join('');

        list.querySelectorAll('.btn-view').forEach(btn =>
            btn.addEventListener('click', () => {
                const u = ManageUsers._cache.find(x => x.user_id === btn.dataset.id);
                if (u) ManageUsers.viewDetail(u);
            })
        );
        list.querySelectorAll('.btn-delete').forEach(btn =>
            btn.addEventListener('click', () => ManageUsers.deleteUser(btn.dataset.id, btn.dataset.name))
        );
        list.querySelectorAll('.btn-toggle').forEach(btn =>
            btn.addEventListener('click', () => ManageUsers.toggleRole(btn.dataset.id, btn.dataset.name, btn.dataset.role))
        );
        list.querySelectorAll('.btn-ban').forEach(btn =>
            btn.addEventListener('click', () => ManageUsers.banUser(btn.dataset.id, btn.dataset.name, btn.dataset.status))
        );
        list.querySelectorAll('.btn-tx').forEach(btn =>
            btn.addEventListener('click', () => ManageUsers.viewTransactions(btn.dataset.id, btn.dataset.name))
        );
        list.querySelectorAll('.btn-verify').forEach(btn =>
            btn.addEventListener('click', () => ManageUsers.verifySeller(btn.dataset.id, btn.dataset.name))
        );
    },

    //ดูรายละเอียดผู้ใช้
    viewDetail: (u) => {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:28px;width:min(480px,95vw);max-height:85vh;overflow-y:auto">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                    <h2 style="font-size:1.1rem;font-weight:600;color:#fff;">${u.name}</h2>
                    <button id="close-user-modal" style="background:none;border:none;color:#fff;font-size:1.4rem;cursor:pointer">✕</button>
                </div>
                <table style="width:100%;font-size:0.88rem;border-collapse:collapse">
                    ${[
                        ['User ID', u.user_id],
                        ['Name', u.name],
                        ['Email', u.email],
                        ['Role', u.role],
                        ['Status', u.status ?? 'active'],
                    ].map(([k, v]) => `
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
                            <td style="padding:12px 14px;color:#e2e8f0;white-space:nowrap">${k}</td>
                            <td style="padding:12px 14px;color:#cbd5e1;word-break:break-all">${v}</td>
                        </tr>`).join('')}
                </table>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('#close-user-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    },

    //จัดการสิทธิ์ผู้ใช้
    banUser: async (id, name, currentStatus) => {
        const isBanned = currentStatus === 'banned';
        const action = isBanned ? 'Unban' : 'Ban';
        const newStatus = isBanned ? 'active' : 'banned';
        if (!confirm(`${action} user "${name}"?`)) return;
        try {
            await Users.updateStatus(id, newStatus);
            await ManageUsers.loadUsers();
        } catch (err) {
            alert(`Failed to ${action.toLowerCase()} user: ` + err.message);
        }
    },

    toggleRole: async (id, name, currentRole) => {
        const next = currentRole === 'customer' ? 'seller' : 'customer';
        if (!confirm(`Change role of "${name}" from ${currentRole} to ${next}?`)) return;
        try {
            await Users.toggleRole(id);
            await ManageUsers.loadUsers();
        } catch (err) {
            alert('Failed to update role: ' + err.message);
        }
    },

    //ดูประวัติธุรกรรมของผู้ใช้
    viewTransactions: async (id, name) => {
        try {
            const records = await Wallet.getRecords(id);
            const rows = records.length === 0
                ? `<tr><td colspan="4" style="text-align:center;padding:24px;opacity:0.5">No transaction history.</td></tr>`
                : records.map((r, i) => {
                    const isIncome = r.payment_type === 'DEPOSIT' || r.payment_type === 'INCOME';
                    const amountColor = isIncome ? '#4ade80' : '#f87171';
                    const sign = isIncome ? '+' : '-';
                    const rowBg = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent';
                    return `<tr style="background:${rowBg}">
                        <td style="padding:10px 14px;color:#cbd5e1;white-space:nowrap">${new Date(r.created_at).toLocaleString('th-TH')}</td>
                        <td style="padding:10px 14px">
                            <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.78rem;font-weight:600;
                                background:${isIncome ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'};
                                color:${amountColor}">
                                ${r.payment_type}
                            </span>
                        </td>
                        <td style="padding:10px 14px;color:${amountColor};font-weight:600;white-space:nowrap">${sign}฿${Number(r.amount).toLocaleString('en-US',{minimumFractionDigits:2})}</td>
                        <td style="padding:10px 14px;color:#e2e8f0">${r.payment_method}</td>
                    </tr>`;
                }).join('');

            const modal = document.createElement('div');
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999';
            modal.innerHTML = `
                <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:28px;width:min(700px,95vw);max-height:80vh;overflow-y:auto">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                        <h2 style="font-size:1.1rem;font-weight:600;color:#fff;">Transaction History — ${name}</h2>
                        <button id="close-tx-modal" style="background:none;border:none;color:#fff;font-size:1.4rem;cursor:pointer">✕</button>
                    </div>
                    <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.12)">
                                <th style="text-align:left;padding:8px 14px;color:#e2e8f0;font-weight:500">Date / Time</th>
                                <th style="text-align:left;padding:8px 14px;color:#e2e8f0;font-weight:500">Type</th>
                                <th style="text-align:left;padding:8px 14px;color:#e2e8f0;font-weight:500">Amount</th>
                                <th style="text-align:left;padding:8px 14px;color:#e2e8f0;font-weight:500">Method</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>`;
            document.body.appendChild(modal);
            modal.querySelector('#close-tx-modal').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        } catch (err) {
            alert('Failed to load transactions: ' + err.message);
        }
    },

    //ลบผู้ใช้
    deleteUser: async (id, name) => {
        if (!confirm(`Delete user "${name}"?`)) return;
        try {
            await Users.delete(id);
            await ManageUsers.loadUsers();
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    },

    verifySeller: async (userId, name) => {
        try {
            const sellerData = await seller.getByUserId(userId);
            if (!sellerData) {
                alert(`No seller profile found for "${name}"`);
                return;
            }
            const current = sellerData.seller_status || 'unverified';
            const choice = prompt(
                `Seller: ${name}\nCurrent status: ${current}\n\nEnter new status:\n  verified\n  unverified\n  suspended`,
                current
            );
            if (!choice) return;
            const newStatus = choice.trim().toLowerCase();
            if (!['verified', 'unverified', 'suspended'].includes(newStatus)) {
                alert('Invalid status. Use: verified, unverified, or suspended');
                return;
            }
            await seller.verifySeller(sellerData.seller_id, newStatus);
            alert(`Seller "${name}" status updated to "${newStatus}"`);
        } catch (err) {
            alert('Failed to update seller status: ' + err.message);
        }
    },

    //ค้นหาผู้ใช้
    onSearch: (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('#user-list tr[data-user-id]').forEach(row => {
            const match = row.dataset.name.toLowerCase().includes(q) || row.dataset.email.toLowerCase().includes(q);
            row.style.display = match ? '' : 'none';
        });
    },
};

const ManageStocks = (() => {
    let _all = [];
    let _typeMap = {};

    const getFiltered = () => {
        const q = document.getElementById('stock-search')?.value.toLowerCase() ?? '';
        const status = document.getElementById('stock-status-filter')?.value ?? '';
        return _all.filter(s =>
            (!q || s.item_name?.toLowerCase().includes(q) || s.shop_name?.toLowerCase().includes(q)) &&
            (!status || s.stock_status === status)
        );
    };
    
    //แสดงสินค้า
    const render = () => {
        const list = document.getElementById('stock-list');
        if (!list) return;
        const items = getFiltered();
        if (!items.length) {
            list.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;opacity:0.5">No items found.</td></tr>`;
            return;
        }
        list.innerHTML = items.map(s => {
            const statusColor = s.stock_status === 'available' ? '#4ade80' : s.stock_status === 'pending' ? '#facc15' : '#f87171';
            return `<tr data-stock-id="${s.stock_id}">
                <td style="padding:10px 16px">
                    ${s.url ? `<img src="${s.url}" style="width:48px;height:48px;object-fit:cover;border-radius:6px" onerror="this.style.display='none'">` : '—'}
                </td>
                <td style="padding:10px 16px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.item_name}</td>
                <td style="padding:10px 16px;opacity:0.7">${s.shop_name ?? '—'}</td>
                <td style="padding:10px 16px">฿${Number(s.price).toLocaleString()}</td>
                <td style="padding:10px 16px">${s.stock_quantity}</td>
                <td style="padding:10px 16px;color:${statusColor};font-weight:600">${s.stock_status}</td>
                <td style="padding:10px 16px;text-align:center;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
                    <button class="btn-view" data-id="${s.stock_id}">👁️</button>
                    ${s.stock_status === 'pending' ? `
                        <button class="btn-status" data-id="${s.stock_id}" data-status="available" style="color:#4ade80">✅</button>
                        <button class="btn-status" data-id="${s.stock_id}" data-status="rejected" style="color:#f87171">❌</button>
                    ` : s.stock_status === 'available' ? `
                        <button class="btn-status" data-id="${s.stock_id}" data-status="banned" style="color:#f87171">🚫</button>
                    ` : s.stock_status === 'banned' ? `
                        <button class="btn-status" data-id="${s.stock_id}" data-status="available" style="color:#4ade80">✅</button>
                    ` : ''}
                    <button class="btn-del" data-id="${s.stock_id}" data-name="${s.item_name}">🗑</button>
                </td>
            </tr>`;
        }).join('');

        list.querySelectorAll('.btn-view').forEach(btn =>
            btn.addEventListener('click', () => {
                const s = _all.find(x => String(x.stock_id) === btn.dataset.id);
                if (s) viewDetail(s);
            })
        );
        list.querySelectorAll('.btn-status').forEach(btn =>
            btn.addEventListener('click', () => changeStatus(btn.dataset.id, btn.dataset.status))
        );
        list.querySelectorAll('.btn-del').forEach(btn =>
            btn.addEventListener('click', () => deleteStock(btn.dataset.id, btn.dataset.name))
        );
    };

    //เปลี่ยนสถานะสินค้า
    const changeStatus = async (id, newStatus) => {
        const s = _all.find(x => String(x.stock_id) === String(id));
        if (!s) return;
        const label = { available: 'Approve / Unban', rejected: 'Reject', banned: 'Ban' }[newStatus] ?? newStatus;
        if (!confirm(`${label} item "${s.item_name}"?`)) return;
        try {
            await Stock.update(id, {
                category_id: s.category_id,
                item_name: s.item_name,
                description: s.description,
                price: s.price,
                stock_quantity: s.stock_quantity,
                item_type: s.item_type,
                stock_status: newStatus,
                url: s.url,
            });
            s.stock_status = newStatus;
            render();
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    //ดูรายละเอียดสินค้า
    const viewDetail = (s) => {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:28px;width:min(520px,95vw);max-height:85vh;overflow-y:auto">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                    <h2 style="font-size:1.1rem;font-weight:600;color:#fff;">${s.item_name}</h2>
                    <button id="close-detail-modal" style="background:none;border:none;color:#fff;font-size:1.4rem;cursor:pointer">✕</button>
                </div>
                ${s.url ? `<img src="${s.url}" style="width:100%;max-height:220px;object-fit:cover;border-radius:8px;margin-bottom:16px">` : ''}
                <table style="width:100%;font-size:0.88rem;border-collapse:collapse">
                    ${[
                        ['Shop', s.shop_name ?? '—'],
                        ['Price', `฿${Number(s.price).toLocaleString()}`],
                        ['Stock', s.stock_quantity],
                        ['Type', s.item_type ?? '—'],
                        ['Status', s.stock_status],
                        ['Category', s.category_name ?? '—'],
                        ['Description', s.description ?? '—'],
                    ].map(([k, v]) => `
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
                            <td style="padding:12px 14px;color:#e2e8f0;white-space:nowrap">${k}</td>
                            <td style="padding:12px 14px;color:#cbd5e1;word-break:break-all">${v}</td>
                        </tr>`).join('')}
                </table>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('#close-detail-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    };

    //ลบสินค้า
    const deleteStock = async (id, name) => {
        if (!confirm(`Permanently delete item "${name}"?`)) return;
        try {
            await Stock.delete(id);
            _all = _all.filter(s => String(s.stock_id) !== String(id));
            render();
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    //กรองสินค้า
    return {
        init: async () => {
            const list = document.getElementById('stock-list');
            try {
                _all = (await Stock.getAll()) ?? [];
                render();
            } catch (err) {
                if (list) list.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#ef4444;padding:40px">${err.message}</td></tr>`;
            }
            document.getElementById('stock-search')?.addEventListener('input', render);
            document.getElementById('stock-status-filter')?.addEventListener('change', render);
        }
    };
})();

const ManageRequests = (() => {
    let _all = [];
    let _typeMap = {};

    //กรอง request
    const getFiltered = () => {
        const q = document.getElementById('req-search')?.value.toLowerCase() ?? '';
        const status = document.getElementById('req-status-filter')?.value ?? '';
        return _all.filter(r =>
            (!q || r.request_title?.toLowerCase().includes(q) || String(r.customer_id).includes(q)) &&
            (!status || r.request_status === status)
        );
    };

    //แสดง request
    const render = () => {
        const list = document.getElementById('req-list');
        if (!list) return;
        const items = getFiltered();
        if (!items.length) {
            list.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;opacity:0.5">No requests found.</td></tr>`;
            return;
        }
        list.innerHTML = items.map(r => {
            const statusColor = r.request_status === 'approved' ? '#4ade80' : r.request_status === 'pending' ? '#facc15' : '#f87171';
            const typeName = _typeMap[r.service_type_id] ?? '—';
            return `<tr data-req-id="${r.request_id}">
                <td style="padding:10px 16px">${r.request_id}</td>
                <td style="padding:10px 16px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.request_title}</td>
                <td style="padding:10px 16px;opacity:0.7">${r.customer_id?.slice(0,8)}…</td>
                <td style="padding:10px 16px;opacity:0.85">${typeName}</td>
                <td style="padding:10px 16px">฿${Number(r.budget).toLocaleString()}</td>
                <td style="padding:10px 16px;color:${statusColor};font-weight:600">${r.request_status}</td>
                <td style="padding:10px 16px;text-align:center;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
                    <button class="btn-req-view" data-id="${r.request_id}">👁️</button>
                    <button class="btn-req-del" data-id="${r.request_id}" data-title="${r.request_title}">🗑</button>
                </td>
            </tr>`;
        }).join('');

        list.querySelectorAll('.btn-req-view').forEach(btn =>
            btn.addEventListener('click', () => {
                const r = _all.find(x => String(x.request_id) === btn.dataset.id);
                if (r) viewDetail(r);
            })
        );
        list.querySelectorAll('.btn-req-del').forEach(btn =>
            btn.addEventListener('click', () => deleteRequest(btn.dataset.id, btn.dataset.title))
        );
    };

    //ดูรายละเอียด request
    const viewDetail = (r) => {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999';
        modal.innerHTML = `
            <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:28px;width:min(520px,95vw);max-height:85vh;overflow-y:auto">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                    <h2 style="font-size:1.1rem;font-weight:600;color:#fff;">${r.request_title}</h2>
                    <button id="close-req-modal" style="background:none;border:none;color:#fff;font-size:1.4rem;cursor:pointer">✕</button>
                </div>
                <table style="width:100%;font-size:0.88rem;border-collapse:collapse">
                    ${[
                        ['Request ID', r.request_id],
                        ['Customer ID', r.customer_id],
                        ['Service Type', _typeMap[r.service_type_id] ?? r.service_type_id ?? '—'],
                        ['Budget', `฿${Number(r.budget).toLocaleString()}`],
                        ['Status', r.request_status],
                        ['Description', r.request_detail ?? '—'],
                    ].map(([k, v]) => `
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.06)">
                            <td style="padding:12px 14px;color:#e2e8f0;white-space:nowrap">${k}</td>
                            <td style="padding:12px 14px;color:#cbd5e1;word-break:break-all">${v}</td>
                        </tr>`).join('')}
                </table>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('#close-req-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    };


    //ลบ request
    const deleteRequest = async (id, title) => {
        if (!confirm(`Permanently delete request "${title}"?`)) return;
        try {
            await Requests.deleteRequest(id);
            _all = _all.filter(r => String(r.request_id) !== String(id));
            render();
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    return {
        init: async () => {
            const list = document.getElementById('req-list');
            try {
                const [requests, types] = await Promise.all([
                    Requests.getRequests(),
                    serviceType.getAllServiceType(),
                ]);
                _all = requests ?? [];
                _typeMap = Object.fromEntries((types ?? []).map(t => [t.service_type_id, t.name]));
                render();
            } catch (err) {
                if (list) list.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#ef4444;padding:40px">${err.message}</td></tr>`;
            }
            document.getElementById('req-search')?.addEventListener('input', render);
            document.getElementById('req-status-filter')?.addEventListener('change', render);
            ManageServiceTypes.init();
        }
    };
})();

//admin จัดการประเภทบริการ
const ManageServiceTypes = (() => {
    let _types = [];

    const render = () => {
        const list = document.getElementById('svt-list');
        if (!list) return;
        if (!_types.length) {
            list.innerHTML = `<li style="opacity:0.5;padding:8px 0">No service types found.</li>`;
            return;
        }
        list.innerHTML = _types.map(t => `
            <li style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                <span id="svt-name-${t.service_type_id}" style="flex:1">${t.name}</span>
                <div style="display:flex;gap:6px;margin-left:12px">
                    <button class="btn-svt-edit" data-id="${t.service_type_id}" data-name="${t.name}"
                        style="background:none;border:none;color:#facc15;cursor:pointer;font-size:0.85rem">✏️</button>
                    <button class="btn-svt-del" data-id="${t.service_type_id}" data-name="${t.name}"
                        style="background:none;border:none;color:#f87171;cursor:pointer;font-size:0.85rem">🗑</button>
                </div>
            </li>
        `).join('');

        list.querySelectorAll('.btn-svt-edit').forEach(btn =>
            btn.addEventListener('click', () => editType(btn.dataset.id, btn.dataset.name))
        );
        list.querySelectorAll('.btn-svt-del').forEach(btn =>
            btn.addEventListener('click', () => deleteType(btn.dataset.id, btn.dataset.name))
        );
    };

    const addType = async () => {
        const input = document.getElementById('svt-input');
        const name = input?.value.trim();
        if (!name) return;
        try {
            await serviceType.createServiceType({ name });
            input.value = '';
            _types = (await serviceType.getAllServiceType()) ?? [];
            render();
        } catch (err) {
            alert('Failed to add: ' + err.message);
        }
    };

    const editType = async (id, currentName) => {
        const newName = prompt('Edit service type name:', currentName);
        if (!newName || newName.trim() === currentName) return;
        try {
            await serviceType.updateServiceType(id, { name: newName.trim() });
            const t = _types.find(x => String(x.service_type_id) === String(id));
            if (t) t.name = newName.trim();
            render();
        } catch (err) {
            alert('Failed to update: ' + err.message);
        }
    };

    const deleteType = async (id, name) => {
        if (!confirm(`Delete service type "${name}"?`)) return;
        try {
            await serviceType.deleteServiceType(id);
            _types = _types.filter(t => String(t.service_type_id) !== String(id));
            render();
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    return {
        init: async () => {
            try {
                _types = (await serviceType.getAllServiceType()) ?? [];
                render();
            } catch { render(); }
            document.getElementById('svt-add-btn')?.addEventListener('click', addType);
            document.getElementById('svt-input')?.addEventListener('keydown', e => {
                if (e.key === 'Enter') addType();
            });
        }
    };
})();

const Router = (() => {

    const PAGE_MAP = {
        user: "../../pages/admin/pages/manageUser.html",
        stock: "../../pages/admin/pages/manageStock.html",
        request: "../../pages/admin/pages/manageRequest.html",
        nft: "../../pages/admin/pages/manageNFT.html",
        logout: "../../pages/admin/pages/logout.html",
    };

    const PAGE_INIT = {
        logout:  () => requestAnimationFrame(() => Logout.init()),
        user:    () => requestAnimationFrame(() => ManageUsers.init()),
        stock:   () => requestAnimationFrame(() => ManageStocks.init()),
        request: () => requestAnimationFrame(() => ManageRequests.init()),
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
                <p style="font-size:20px">Failed to load page.</p>
                <p>The path is invalid or the file does not exist.</p>
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