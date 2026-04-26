import { checkRole } from "./pageRole.js";
import { Logout } from "./logout.js";
import { Users, Wallet, Stock, Requests, serviceType, seller } from "./api.js";

checkRole?.();

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

        list.innerHTML = `<tr><td class="table-empty">Loading...</td></tr>`;

        try {
            const users = await Users.getAll();
            ManageUsers._cache = users;
            ManageUsers.renderUsers(users);
        } catch (err) {
            list.innerHTML = `<tr><td class="table-error">${err.message}</td></tr>`;
        }
    },

    renderUsers: (users) => {
        const list = document.getElementById('user-list');
        if (!list) return;

        if (!users.length) {
            list.innerHTML = `<tr><td class="table-empty">No users found</td></tr>`;
            return;
        }

        list.innerHTML = users.map(u => `
            <tr data-user-id="${u.user_id}" data-name="${u.name}" data-email="${u.email}">
                <td>${u.user_id.slice(0, 8)}…</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><span class="role-badge role-${u.role}">${u.role}</span></td>
                <td class="${u.status === 'banned' ? 'status-banned' : 'status-active'}">
                    ${u.status ?? 'active'}
                </td>
                <td class="action-group">
                    <button class="btn view" data-id="${u.user_id}">👁️</button>
                    <button class="btn toggle" data-id="${u.user_id}" data-role="${u.role}">🔄</button>
                    <button class="btn tx" data-id="${u.user_id}">📄</button>
                    ${u.role === 'seller' ? `<button class="btn verify" data-id="${u.user_id}">🛡️</button>` : ''}
                    <button class="btn ban ${u.status === 'banned' ? 'btn-success' : 'btn-danger'}"
                        data-id="${u.user_id}" data-status="${u.status}">
                        ${u.status === 'banned' ? '✅' : '🚫'}
                    </button>
                    <button class="btn delete" data-id="${u.user_id}">🗑</button>
                </td>
            </tr>
        `).join('');

        // bind
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

        list.querySelectorAll('.tx').forEach(b =>
            b.onclick = () => ManageUsers.viewTransactions(b.dataset.id));

        list.querySelectorAll('.verify').forEach(b =>
            b.onclick = () => ManageUsers.verifySeller(b.dataset.id));
    },

    viewDetail: (u) => {
        Modal.open(`
            <div class="modal-header">
                <div class="modal-title">${u.name}</div>
                <button data-close class="modal-close">✕</button>
            </div>

            <table class="table">
                <tr><td>ID</td><td>${u.user_id}</td></tr>
                <tr><td>Email</td><td>${u.email}</td></tr>
                <tr><td>Role</td><td>${u.role}</td></tr>
                <tr><td>Status</td><td>${u.status ?? 'active'}</td></tr>
            </table>
        `);
    },

    banUser: async (id, status) => {
        const next = status === 'banned' ? 'active' : 'banned';
        if (!confirm(`Set user to ${next}?`)) return;

        await Users.updateStatus(id, next);
        ManageUsers.loadUsers();
    },

    toggleRole: async (id, role) => {
        const next = role === 'customer' ? 'seller' : 'customer';
        if (!confirm(`Change role to ${next}?`)) return;

        await Users.toggleRole(id);
        ManageUsers.loadUsers();
    },

    viewTransactions: async (id) => {
        const records = await Wallet.getRecords(id);

        Modal.open(`
            <div class="modal-header">
                <div class="modal-title">Transactions</div>
                <button data-close class="modal-close">✕</button>
            </div>

            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Method</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map(r => {
                        const income = ['DEPOSIT','INCOME'].includes(r.payment_type);
                        return `
                        <tr>
                            <td>${new Date(r.created_at).toLocaleString()}</td>
                            <td>
                                <span class="badge ${income?'badge-income':'badge-expense'}">
                                    ${r.payment_type}
                                </span>
                            </td>
                            <td class="${income?'status-active':'status-banned'}">
                                ${income?'+':'-'}฿${Number(r.amount).toLocaleString()}
                            </td>
                            <td>${r.payment_method}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `);
    },

    deleteUser: async (id) => {
        if (!confirm("Delete user?")) return;
        await Users.delete(id);
        ManageUsers.loadUsers();
    },

    verifySeller: async (userId) => {
        const s = await seller.getByUserId(userId);
        if (!s) return alert("No seller profile");

        const status = prompt("verified / unverified / suspended", s.seller_status);
        if (!status) return;

        await seller.verifySeller(s.seller_id, status);
        alert("Updated");
    },

    onSearch: (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('#user-list tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
        });
    }
};


const Router = (() => {

    const PAGE_MAP = {
        user: "../../pages/admin/pages/manageUser.html",
        logout: "../../pages/admin/pages/logout.html",
    };

    const PAGE_INIT = {
        logout: () => Logout.init(),
        user: () => ManageUsers.init(),
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