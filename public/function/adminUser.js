import { Users, Wallet } from "./api.js";

const openModal = (html) => {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `<div class="modal-box">${html}</div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
    modal.querySelectorAll("[data-close]").forEach(btn =>
        btn.addEventListener("click", () => modal.remove())
    );
    return modal;
};

export const ManageUsers = {
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

        if (!users.length) {
            list.innerHTML = `<p class="mgr-empty">No users found</p>`;
            return;
        }

        list.innerHTML = users.map(u => {
            const status = u.status ?? 'active';
            const statusKey = status.toLowerCase();
            const initial = (u.name || '?')[0].toUpperCase();
            return `
            <div class="mgr-card">
                <div class="mgr-card__avatar">${initial}</div>
                <div class="mgr-card__info">
                    <div class="mgr-card__name">${u.name}</div>
                    <div class="mgr-card__sub">${u.email}</div>
                    <div class="mgr-card__meta">#${u.user_id.slice(0, 8)}…</div>
                </div>
                <div class="mgr-card__right">
                    <div style="display:flex;gap:6px;align-items:center">
                        <span style="padding:3px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;background:rgba(124,58,237,0.1);color:#7c3aed;">${u.role}</span>
                        <span class="mgr-badge mgr-badge-${statusKey}">${status}</span>
                    </div>
                    <div style="display:flex;gap:4px">
                        <button class="mgr-btn view" data-id="${u.user_id}" title="View"><span class="fi fi-ts-eye"></span></button>
                        <button class="mgr-btn toggle" data-id="${u.user_id}" data-role="${u.role}" title="Toggle Role"><span class="fi fi-ts-users"></span></button>
                        <button class="mgr-btn ban" data-id="${u.user_id}" data-status="${u.status}" title="Ban/Unban" style="color:#d97706"><span class="fi fi-ts-ban"></span></button>
                        <button class="mgr-btn delete" data-id="${u.user_id}" title="Delete" style="color:#dc2626"><span class="fi fi-ts-trash"></span></button>
                    </div>
                </div>
            </div>
        `}).join('');

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
        openModal(`
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
        document.querySelectorAll('#user-list .mgr-card').forEach(card => {
            card.style.display = card.innerText.toLowerCase().includes(q) ? '' : 'none';
        });
    }
};

export const ManageWallet = (() => {
    let _all = [];

    const TYPE_COLOR = {
        DEPOSIT:  "#16a34a",
        INCOME:   "#16a34a",
        WITHDRAW: "#dc2626",
        PAYMENT:  "#dc2626",
        HOLD:     "#d97706",
        REFUND:   "#7c3aed",
    };

    const TYPE_BG = {
        DEPOSIT:  "rgba(22,163,74,0.1)",
        INCOME:   "rgba(22,163,74,0.1)",
        WITHDRAW: "rgba(220,38,38,0.1)",
        PAYMENT:  "rgba(220,38,38,0.1)",
        HOLD:     "rgba(217,119,6,0.1)",
        REFUND:   "rgba(124,58,237,0.1)",
    };

    const TYPE_ICON = {
        DEPOSIT:  "↑",
        INCOME:   "↑",
        WITHDRAW: "↓",
        PAYMENT:  "↓",
        HOLD:     "⏸",
        REFUND:   "↩",
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
            <div style="background:rgba(255,255,255,0.78);border:1.5px solid ${TYPE_BG[type]||'rgba(124,58,237,0.12)'};
                border-radius:14px;padding:16px 22px;min-width:140px;
                box-shadow:0 2px 12px rgba(63,2,80,0.08);backdrop-filter:blur(10px);">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                    <span style="font-size:1rem;color:${TYPE_COLOR[type]||'#475569'};">${TYPE_ICON[type]||'•'}</span>
                    <span style="font-size:0.72rem;font-weight:700;letter-spacing:0.6px;color:#64748b;text-transform:uppercase;">${type}</span>
                </div>
                <div style="font-size:1.18rem;font-weight:800;color:${TYPE_COLOR[type]||'#1a1a2e'};">
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
            list.innerHTML = `<p class="recon-empty">No records found</p>`;
            return;
        }

        list.innerHTML = records.map(r => {
            const d = new Date(r.created_at);
            const day   = d.toLocaleString("th-TH", { day: "2-digit" });
            const month = d.toLocaleString("th-TH", { month: "short" });
            const time  = d.toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit" });
            const color = TYPE_COLOR[r.payment_type] || "#475569";
            const bg    = TYPE_BG[r.payment_type]    || "rgba(100,116,139,0.1)";
            const icon  = TYPE_ICON[r.payment_type]  || "•";
            return `
            <div class="recon-card">
                <div class="recon-card__date">
                    <span class="recon-card__day">${day}</span>
                    <span class="recon-card__month">${month}</span>
                </div>
                <div class="recon-card__info">
                    <div class="recon-card__name">${r.user_name}</div>
                    <div class="recon-card__email">${r.user_email}</div>
                    <div class="recon-card__method">${r.payment_method} · ${time}</div>
                </div>
                <div class="recon-card__right">
                    <div class="recon-card__amount" style="color:${color}">
                        ${icon} ฿${Number(r.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </div>
                    <span class="recon-card__badge" style="background:${bg};color:${color}">
                        ${r.payment_type}
                    </span>
                    <span class="recon-card__status">${r.status}</span>
                </div>
            </div>
        `}).join("");
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
