import { Requests, Category } from "./api.js";

const listEl = document.getElementById("request-list");
const msgEl  = document.getElementById("msg");

let categories = [];

function showMsg(text) {
    msgEl.textContent = text;
    setTimeout(() => msgEl.textContent = "", 2500);
}

function badgeClass(status) {
    if (status === "accepted") return "badge accepted";
    if (status === "rejected") return "badge rejected";
    return "badge pending";
}

function categoryName(category_id) {
    const cat = categories.find(c => c.category_id === category_id);
    return cat ? cat.name : "-";
}

function renderRequests(requests) {
    if (!requests.length) {
        listEl.innerHTML = `<p class="empty">No requests found.</p>`;
        return;
    }

    listEl.innerHTML = requests.map(r => `
        <div class="card" data-id="${r.request_id}">
            <div class="card-title">${r.request_title}</div>
            <div class="card-detail">${r.request_detail || "-"}</div>
            <div class="card-meta">
                <span>Budget: ${r.budget ?? "-"}</span>
                <span>Category: ${categoryName(r.category_id)}</span>
                <span class="${badgeClass(r.request_status)}">${r.request_status}</span>
            </div>
            <div class="card-actions">
                <button class="btn-accept"  data-id="${r.request_id}" data-status="accepted">Accept</button>
                <button class="btn-reject"  data-id="${r.request_id}" data-status="rejected">Reject</button>
                <button class="btn-pending" data-id="${r.request_id}" data-status="pending">Pending</button>
            </div>
        </div>
    `).join("");

    listEl.querySelectorAll("button[data-status]").forEach(btn => {
        btn.addEventListener("click", () => updateStatus(btn));
    });
}

async function updateStatus(btn) {
    const id     = btn.dataset.id;
    const status = btn.dataset.status;

    const card = listEl.querySelector(`.card[data-id="${id}"]`);
    card.querySelectorAll("button").forEach(b => b.disabled = true);

    try {
        await Requests.updateRequestStatus(id, { request_status: status });
        showMsg(`Request #${id} updated to "${status}"`);
        await loadRequests();
    } catch (err) {
        showMsg(err.message || "Update failed");
        card.querySelectorAll("button").forEach(b => b.disabled = false);
    }
}

async function loadRequests() {
    try {
        const requests = await Requests.getRequests();
        renderRequests(requests);
    } catch (err) {
        listEl.innerHTML = `<p class="empty">Failed to load requests.</p>`;
    }
}

async function init() {
    try {
        categories = await Category.getAll();
    } catch (_) {
        categories = [];
    }
    await loadRequests();
}

init();
