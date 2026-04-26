import { Requests, Category } from "./api.js";

const listEl   = document.getElementById("requestList");
const filterBtns = document.querySelectorAll(".filter-tab");

let categories   = [];
let allRequests  = [];
let activeStatus = "all";

function categoryName(category_id) {
    const cat = categories.find(c => c.category_id === category_id);
    return cat ? cat.name : "-";
}

function badgeClass(status) {
    if (status === "accepted") return "badge accepted";
    if (status === "rejected") return "badge rejected";
    return "badge pending";
}

function renderRequests(requests) {
    const filtered = activeStatus === "all"
        ? requests
        : requests.filter(r => r.request_status === activeStatus);

    if (!filtered.length) {
        listEl.innerHTML = `<p style="color:var(--clr-text-muted);text-align:center;padding:40px 0;">No requests found.</p>`;
        return;
    }

    listEl.innerHTML = filtered.map(r => `
        <div class="booking-card" data-id="${r.request_id}">
            <div class="booking-card__header">
                <span class="booking-card__title">${r.request_title}</span>
                <span class="${badgeClass(r.request_status)}">${r.request_status}</span>
            </div>
            <p class="booking-card__detail">${r.request_detail || "-"}</p>
            <div class="booking-card__meta">
                <span>Budget: ${r.budget ?? "-"} THB</span>
                <span>Category: ${categoryName(r.category_id)}</span>
            </div>
            <div class="booking-card__actions">
                <button class="btn btn--primary" data-id="${r.request_id}" data-status="accepted">Accept</button>
                <button class="btn btn--ghost"   data-id="${r.request_id}" data-status="rejected">Reject</button>
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

    const card = listEl.querySelector(`[data-id="${id}"]`);
    card.querySelectorAll("button").forEach(b => b.disabled = true);

    try {
        await Requests.updateRequestStatus(id, { request_status: status });
        await loadRequests();
    } catch (err) {
        card.querySelectorAll("button").forEach(b => b.disabled = false);
    }
}

async function loadRequests() {
    try {
        allRequests = await Requests.getRequests();
        renderRequests(allRequests);
    } catch {
        listEl.innerHTML = `<p style="color:var(--clr-text-muted);text-align:center;padding:40px 0;">Failed to load requests.</p>`;
    }
}

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeStatus = btn.dataset.status;
        renderRequests(allRequests);
    });
});

export const Accept = {
    init() {
    try {
        categories = await Category.getAll();
    } catch {
        categories = [];
    }
    await loadRequests();}
};