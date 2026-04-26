import { Requests } from "./api.js";


let listEl;
let filterBtns;
let allRequests  = [];
let activeStatus = "all";

function badgeClass(status) {
    const s = (status || "").toUpperCase();
    if (s === "ACCEPTED")  return "badge accepted";
    if (s === "REJECTED")  return "badge rejected";
    if (s === "DONE" || s === "COMPLETED") return "badge done";
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
            <button class="btn btn--done" data-id="${r.request_id}" data-status="DONE">Mark as Done</button>
        `;
    }
    return "";
}

const REQ_PRIORITY = { WAITING: 0, PENDING: 0, ACCEPTED: 1, DONE: 2, COMPLETE: 3, COMPLETED: 3, REJECTED: 4 };

function sortRequests(requests) {
    return [...requests].sort((a, b) =>
        (REQ_PRIORITY[(a.request_status || "").toUpperCase()] ?? 9) -
        (REQ_PRIORITY[(b.request_status || "").toUpperCase()] ?? 9)
    );
}

function renderRequests(requests) {
    if (!listEl) return;

    const filtered = sortRequests(activeStatus === "all"
        ? requests
        : requests.filter(r => (r.request_status || "").toUpperCase() === activeStatus.toUpperCase()));

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
                    <span class="booking-card__customer"><span class="fi fi-ts-user"></span> ${r.customer_name || "Customer"}</span>
                </div>
                <span class="${badgeClass(r.request_status)}">${r.request_status}</span>
            </div>
            <p class="booking-card__detail">${r.request_detail || "-"}</p>
            <div class="booking-card__meta">
                <span class="booking-card__meta-chip"><span class="fi fi-ts-sack-dollar"></span> ${Number(r.budget ?? 0).toLocaleString()} THB</span>
                <span class="booking-card__meta-chip"><span class="fi fi-ts-tags"></span> ${r.service_type_name || "-"}</span>
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
        if (status === "ACCEPTED") {
            const seller_user_id = localStorage.getItem("user_id");
            await Requests.acceptRequest(id, { seller_user_id });
        } else {
            await Requests.updateRequestStatus(id, { request_status: status });
        }
        await loadRequests();
    } catch (err) {
        alert("เกิดข้อผิดพลาด: " + err.message);
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

        bindFilters();
        loadRequests();
    }
};
