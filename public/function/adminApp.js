import { checkRole } from "./pageRole.js";
import { Logout } from "./logout.js";
import { Users, Wallet, Stock, Requests } from "./api.js";

checkRole?.();

/* =========================
   MODAL
========================= */
const Modal = {
    open(html) {
        const modal = document.createElement("div");
        modal.className = "modal-overlay";

        modal.innerHTML = `
            <div class="modal-box">
                ${html}
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener("click", e => {
            if (e.target === modal) modal.remove();
        });

        modal.querySelectorAll("[data-close]").forEach(btn =>
            btn.addEventListener("click", () => modal.remove())
        );

        return modal;
    }
};

/* =========================
   MANAGE USERS
========================= */
const ManageUsers = {
    _cache: [],

    init: async () => {
        await ManageUsers.loadUsers();
        document.getElementById('user-search')
            ?.addEventListener('input', ManageUsers.onSearch);
    },

    loadUsers: async () => {
        const list = document.getElementById('user-list');
        if (!list) return;

        list.innerHTML = `<tr><td>Loading...</td></tr>`;

        try {
            const users = await Users.getAll();
            ManageUsers._cache = users;
            ManageUsers.renderUsers(users);
        } catch (err) {
            list.innerHTML = `<tr><td>${err.message}</td></tr>`;
        }
    },

    renderUsers: (users) => {
        const list = document.getElementById('user-list');
        if (!list) return;

        list.innerHTML = users.map(u => `
            <tr>
                <td>${u.user_id.slice(0, 8)}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>${u.status ?? 'active'}</td>
                <td>
                    <button class="view" data-id="${u.user_id}"><span class="fi fi-ts-eye"></span></button>
                    <button class="toggle" data-id="${u.user_id}" data-role="${u.role}"><span class="fi fi-ts-users"></span></button>
                    <button class="ban" data-id="${u.user_id}" data-status="${u.status}"><span class="fi fi-ts-ban"></span></button>
                    <button class="delete" data-id="${u.user_id}"><span class="fi fi-ts-trash"></span></button>
                </td>
            </tr>
        `).join('');

        list.querySelectorAll('.view').forEach(b =>
            b.onclick = () => {
                const u = ManageUsers._cache.find(x => x.user_id === b.dataset.id);
                u && ManageUsers.viewDetail(u);
            });

        list.querySelectorAll('.delete').forEach(b =>
            b.onclick = () => ManageUsers.deleteUser(b.dataset.id));

        list.querySelectorAll('.toggle').forEach(b =>
            b.onclick = () => ManageUsers.toggleRole(b.dataset.id, b.dataset.role));

        list.querySelectorAll('.ban').forEach(b =>
            b.onclick = () => ManageUsers.banUser(b.dataset.id, b.dataset.status));
    },

    viewDetail: (u) => {
        Modal.open(`
            <h2>${u.name}</h2>
            <p>${u.email}</p>
            <p>${u.role}</p>
        `);
    },

    banUser: async (id, status) => {
        const next = status === 'banned' ? 'active' : 'banned';
        await Users.updateStatus(id, next);
        ManageUsers.loadUsers();
    },

    toggleRole: async (id) => {
        await Users.toggleRole(id);
        ManageUsers.loadUsers();
    },

    deleteUser: async (id) => {
        if (!confirm("Delete user?")) return;
        await Users.delete(id);
        ManageUsers.loadUsers();
    },

    onSearch: (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('#user-list tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
        });
    }
};

/* =========================
   MANAGE STOCKS
========================= */
const ManageStocks = (() => {
    let _all = [];

    const render = () => {
        const list = document.getElementById('stock-list');
        if (!list) return;

        list.innerHTML = _all.map(s => `
            <tr>
                <td>${s.item_name}</td>
                <td>฿${s.price}</td>
                <td>${s.stock_status}</td>
                <td>
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

/* =========================
   MANAGE REQUESTS
========================= */
const ManageRequests = (() => {
    let _all = [];

    const render = () => {
        const list = document.getElementById('req-list');
        if (!list) return;

        list.innerHTML = _all.map(r => `
            <tr>
                <td>${r.request_title}</td>
                <td>฿${r.budget}</td>
                <td>${r.request_status}</td>
                <td>
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

/* =========================
   MANAGE WALLET (RECONCILIATION)
========================= */
const ManageWallet = (() => {
    let _all = [];

    const TYPE_COLOR = {
        DEPOSIT:  "#22c55e",
        INCOME:   "#22c55e",
        WITHDRAW: "#ef4444",
        PAYMENT:  "#ef4444",
        HOLD:     "#f59e0b",
        REFUND:   "#6366f1",
    };

    function formatDate(str) {
        const d = new Date(str);
        return d.toLocaleString("th-TH", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    }

    function renderSummary(records) {
        const totals = {};
        records.forEach(r => {
            totals[r.payment_type] = (totals[r.payment_type] || 0) + Number(r.amount);
        });

        const el = document.getElementById("recon-summary");
        if (!el) return;

        el.innerHTML = Object.entries(totals).map(([type, sum]) => `
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
                border-radius:12px;padding:14px 20px;min-width:130px;">
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);margin-bottom:4px;">${type}</div>
                <div style="font-size:1.15rem;font-weight:700;color:${TYPE_COLOR[type] || '#e5e7eb'};">
                    ฿${sum.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </div>
            </div>
        `).join("");
    }

    function renderTable(records) {
        const list = document.getElementById("recon-list");
        const count = document.getElementById("recon-count");
        if (!list) return;

        if (count) count.textContent = `${records.length} records`;

        if (!records.length) {
            list.innerHTML = `<tr><td colspan="6"
                style="text-align:center;padding:40px;color:rgba(255,255,255,0.4);">
                No records found</td></tr>`;
            return;
        }

        list.innerHTML = records.map(r => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                <td style="padding:10px 14px;color:rgba(255,255,255,0.6);font-size:0.82rem;">
                    ${formatDate(r.created_at)}
                </td>
                <td style="padding:10px 14px;">
                    <div style="font-weight:500;">${r.user_name}</div>
                    <div style="font-size:0.78rem;color:rgba(255,255,255,0.45);">${r.user_email}</div>
                </td>
                <td style="padding:10px 14px;">
                    <span style="padding:3px 10px;border-radius:6px;font-size:0.8rem;font-weight:600;
                        background:rgba(255,255,255,0.07);color:${TYPE_COLOR[r.payment_type] || '#e5e7eb'};">
                        ${r.payment_type}
                    </span>
                </td>
                <td style="padding:10px 14px;text-align:right;font-weight:600;
                    color:${TYPE_COLOR[r.payment_type] || '#e5e7eb'};">
                    ฿${Number(r.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </td>
                <td style="padding:10px 14px;color:rgba(255,255,255,0.7);">${r.payment_method}</td>
                <td style="padding:10px 14px;color:rgba(255,255,255,0.7);">${r.status}</td>
            </tr>
        `).join("");
    }

    function applyFilter() {
        const typeFilter = document.getElementById("recon-type-filter")?.value || "";
        const search     = (document.getElementById("recon-search")?.value || "").toLowerCase();

        const filtered = _all.filter(r => {
            const matchType   = !typeFilter || r.payment_type === typeFilter;
            const matchSearch = !search ||
                r.user_name?.toLowerCase().includes(search) ||
                r.user_email?.toLowerCase().includes(search);
            return matchType && matchSearch;
        });

        renderTable(filtered);
    }

    return {
        init: async () => {
            try {
                _all = await Wallet.getAdminRecords();
                renderSummary(_all);
                renderTable(_all);

                document.getElementById("recon-type-filter")?.addEventListener("change", applyFilter);
                document.getElementById("recon-search")?.addEventListener("input", applyFilter);
            } catch (err) {
                const list = document.getElementById("recon-list");
                if (list) list.innerHTML = `<tr><td colspan="6"
                    style="text-align:center;padding:40px;color:#ef4444;">
                    ${err.message}</td></tr>`;
            }
        }
    };
})();

const Router = (() => {
const PAGE_MAP = {
    user:           "/pages/admin/pages/manageUser.html",
    stock:          "/pages/admin/pages/manageStock.html",
    request:        "/pages/admin/pages/manageRequest.html",
    reconciliation: "/pages/admin/pages/reconciliation.html",
    logout:         "/pages/admin/pages/logout.html",
};

    const PAGE_INIT = {
        user:           () => ManageUsers.init(),
        stock:          () => ManageStocks.init(),
        request:        () => ManageRequests.init(),
        reconciliation: () => ManageWallet.init(),
        logout:         () => Logout.init(),
    };

    const canvas = () => document.getElementById("canvasContent");

    async function navigate(page) {
        const res = await fetch(PAGE_MAP[page]);
        const html = await res.text();
        canvas().innerHTML = html;
        PAGE_INIT[page]?.();
    }

    function init() {
        document.addEventListener("click", e => {
            const el = e.target.closest("[data-page]");
            if (!el) return;
            e.preventDefault();
            navigate(el.dataset.page);
        });

        navigate("user");
    }

    return { init };
})();

document.addEventListener("DOMContentLoaded", Router.init);