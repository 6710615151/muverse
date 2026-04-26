import { Requests, seller } from "./api.js";

let listEl;
let filterBtns;
let allRequests  = [];
let activeStatus = "all";
let currentSellerId = null;

function badgeClass(status) {
    const s = (status || "").toUpperCase();
    if (s === "ACCEPTED")  return "badge accepted";
    if (s === "REJECTED")  return "badge rejected";
    if (s === "COMPLETED") return "badge done";
    return "badge pending";
}

function actionButtons(r) {
    const s = (r.request_status || "").toUpperCase();
    if (s === "PENDING" || s === "WAITING") {
        return `
            <button class="btn btn--primary" data-id="${r.request_id}" data-status="ACCEPTED">Accept</button>
            <button class="btn btn--ghost"   data-id="${r.request_id}" data-status="REJECTED">Reject</button>
        `;
    }
    if (s === "ACCEPTED") {
        return `
            <button class="btn btn--done" data-id="${r.request_id}" data-status="COMPLETED">Mark as Done</button>
        `;
    }
    return "";
}

function renderRequests(requests) {
    if (!listEl) return;

    const filtered = activeStatus === "all"
        ? requests
        : requests.filter(r => (r.request_status || "").toUpperCase() === activeStatus.toUpperCase());

    if (!filtered.length) {
        listEl.innerHTML = `<p style="color:var(--clr-text-muted);text-align:center;padding:40px 0;">No requests found.</p>`;
        return;
    }

    listEl.innerHTML = filtered.map(r => `
        <div class="booking-card booking-card--${(r.request_status || "").toLowerCase()}" data-id="${r.request_id}">
            <div class="booking-card__top-bar"></div>
            <div class="booking-card__header">
                <div class="booking-card__title-group">
                    <span class="booking-card__title">${r.request_title}</span>
                    <span class="booking-card__customer">👤 ${r.customer_name || "Customer"}</span>
                </div>
                <span class="${badgeClass(r.request_status)}">${r.request_status}</span>
            </div>
            <p class="booking-card__detail">${r.request_detail || "-"}</p>
            <div class="booking-card__meta">
                <span class="booking-card__meta-chip">💰 ${Number(r.budget ?? 0).toLocaleString()} THB</span>
                <span class="booking-card__meta-chip">🔖 ${r.service_type_name || "-"}</span>
            </div>
            ${actionButtons(r) ? `<div class="booking-card__actions">${actionButtons(r)}</div>` : ""}
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
    if (!card) return;

    card.querySelectorAll("button").forEach(b => b.disabled = true);

    try {
        const body = { request_status: status };
        if (status === "ACCEPTED" && currentSellerId) {
            body.seller_id = currentSellerId;
        }
        await Requests.updateRequestStatus(id, body);
        await loadRequests();
    } catch {
        card.querySelectorAll("button").forEach(b => b.disabled = false);
    }
}

async function loadRequests() {
    if (!listEl) return;

    try {
        allRequests = await Requests.getRequests();
        renderRequests(allRequests);
    } catch {
        listEl.innerHTML = `<p style="color:var(--clr-text-muted);text-align:center;padding:40px 0;">Failed to load requests.</p>`;
    }
}

function bindFilters() {
    if (!filterBtns) return;

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeStatus = btn.dataset.status;
            renderRequests(allRequests);
        });
    });
}

export const Accept = {
    async init() {
        listEl     = document.getElementById("requestList");
        filterBtns = document.querySelectorAll(".filter-tab");

        if (!listEl) return;

        const userId = localStorage.getItem("user_id");
        if (userId) {
            try {
                const sellerData = await seller.getByUserId(userId);
                currentSellerId = sellerData?.seller_id ?? null;
            } catch {
                currentSellerId = null;
            }
        }

        bindFilters();
        loadRequests();
    }
};
