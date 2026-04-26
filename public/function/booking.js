import { Requests, serviceType, Review } from "./api.js";

const getCustomerId = () => localStorage.getItem("user_id");

const STATUS_LABEL = {
  pending:   "Pending",
  PENDING:   "Pending",
  accepted:  "Accepted",
  ACCEPTED:  "Accepted",
  done:      "Done",
  DONE:      "Done",
  complete:  "Completed",
  COMPLETED: "Completed",
  rejected:  "Rejected",
  REJECTED:  "Rejected",
};

const STATUS_CLASS = {
  pending:   "status-badge--pending",
  PENDING:   "status-badge--pending",
  accepted:  "status-badge--accepted",
  ACCEPTED:  "status-badge--accepted",
  done:      "status-badge--done",
  DONE:      "status-badge--done",
  complete:  "status-badge--done",
  COMPLETED: "status-badge--done",
  rejected:  "status-badge--rejected",
  REJECTED:  "status-badge--rejected",
};

let _allRequests = [];
let _activeFilter = "all";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return { day: d.getDate(), month: d.toLocaleString("th-TH", { month: "short" }) };
}

const REQUEST_PRIORITY = { WAITING: 0, PENDING: 0, ACCEPTED: 1, DONE: 2, COMPLETE: 3, COMPLETED: 3, REJECTED: 4 };

function sortRequests(requests) {
  return [...requests].sort((a, b) =>
    (REQUEST_PRIORITY[(a.request_status || "").toUpperCase()] ?? 9) -
    (REQUEST_PRIORITY[(b.request_status || "").toUpperCase()] ?? 9)
  );
}

function renderList(requests) {
  const list = document.getElementById("requestList");
  if (!list) return;

  const filtered = sortRequests(_activeFilter === "all"
    ? requests
    : requests.filter(r =>
        r.request_status === _activeFilter ||
        (r.request_status || "").toUpperCase() === _activeFilter.toUpperCase()
      ));

  if (filtered.length === 0) {
    list.innerHTML = `<p style="color:var(--clr-text-muted); text-align:center; padding:40px 0;">No requests found</p>`;
    return;
  }

  list.innerHTML = filtered.map(r => {
    const { day, month } = formatDate(r.created_at);
    const statusClass = STATUS_CLASS[r.request_status] || "status-badge--pending";
    const statusLabel = STATUS_LABEL[r.request_status] || r.request_status;
    const statusUp    = (r.request_status || "").toUpperCase();

    let actionBtn = "";
    if (statusUp === "DONE" && r.seller_id) {
      actionBtn = `
        <button class="btn btn--primary btn--sm btn-pay-now"
          data-id="${r.request_id}"
          data-amount="${r.budget || 0}"
          data-title="${r.request_title}">
          ยืนยันรับบริการ ฿${Number(r.budget || 0).toLocaleString()}
        </button>`;
    } else if (statusUp === "COMPLETE" && r.seller_id) {
      actionBtn = `
        <button class="btn-leave-review" data-id="${r.request_id}" data-seller-id="${r.seller_id || ""}"
          style="padding:6px 14px;border-radius:6px;border:none;background:#0f766e;color:#fff;cursor:pointer;font-size:0.82rem;font-weight:600;margin-left:8px">
          Leave Review
        </button>`;
    }

    return `
      <div class="booking-item booking-item--${(r.request_status || "").toLowerCase()}">
        <div class="booking-item__accent"></div>
        <div class="booking-item__date">
          <span class="booking-item__day">${day}</span>
          <span class="booking-item__month">${month}</span>
        </div>
        <div class="booking-item__info">
          <div class="booking-item__name">${r.request_title}</div>
          <div class="booking-item__meta">
            <span class="booking-item__detail-text">${r.request_detail || "-"}</span>
            <span class="booking-item__budget">฿ ${Number(r.budget || 0).toLocaleString()}</span>
          </div>
        </div>
        <div class="booking-item__actions">
          <span class="status-badge ${statusClass}">${statusLabel}</span>
          ${actionBtn}
        </div>
      </div>
    `;
  }).join("");

  list.querySelectorAll(".btn-pay-now").forEach(btn => {
    btn.addEventListener("click", () => handleServicePayment({
      id:     btn.dataset.id,
      amount: btn.dataset.amount,
      title:  btn.dataset.title,
    }));
  });

  list.querySelectorAll(".btn-leave-review").forEach(btn => {
    btn.addEventListener("click", () => openReviewModal(btn.dataset.id, btn.dataset.sellerId));
  });
}

async function handleServicePayment({ id, amount, title }) {
  if (!confirm(`ยืนยันรับบริการและปลดล็อกเงิน ฿${Number(amount).toLocaleString()} ให้ผู้ขาย?`)) return;

  try {
    await Requests.completeRequest(id);

    alert("ยืนยันเสร็จสิ้น ระบบโอนเงินให้ผู้ขายแล้ว!");
    await loadRequests();
    window.WalletFlow?.loadBalance?.();
  } catch (err) {
    alert("เกิดข้อผิดพลาด: " + err.message);
  }
}

function openReviewModal(requestId, sellerId) {
  const existing = document.getElementById("reviewModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "reviewModal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999";
  modal.innerHTML = `
    <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:28px;width:min(420px,95vw)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 style="color:#fff;margin:0;font-size:1.1rem">Leave a Review</h3>
        <button id="btnCloseReview" style="background:none;border:none;color:#fff;font-size:1.4rem;cursor:pointer">✕</button>
      </div>
      <div style="margin-bottom:16px">
        <label style="color:#e2e8f0;font-size:0.9rem;display:block;margin-bottom:8px">Rating</label>
        <div id="starRating" style="display:flex;gap:8px;font-size:2rem;cursor:pointer">
          ${[1,2,3,4,5].map(i => `<span data-star="${i}" style="color:#4b5563;transition:color 0.15s">★</span>`).join("")}
        </div>
        <input type="hidden" id="reviewRating" value="0">
      </div>
      <div style="margin-bottom:20px">
        <label style="color:#e2e8f0;font-size:0.9rem;display:block;margin-bottom:8px">Comment (optional)</label>
        <textarea id="reviewComment" rows="3"
          style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px;color:#fff;resize:none;font-size:0.9rem"></textarea>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button id="btnCancelReview"
          style="padding:8px 18px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:#e2e8f0;cursor:pointer">
          Cancel
        </button>
        <button id="btnSubmitReview"
          style="padding:8px 18px;border-radius:8px;border:none;background:#7c3aed;color:#fff;font-weight:600;cursor:pointer">
          Submit
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const stars       = modal.querySelectorAll("[data-star]");
  const ratingInput = modal.querySelector("#reviewRating");

  stars.forEach(star => {
    star.addEventListener("mouseover", () => {
      const val = Number(star.dataset.star);
      stars.forEach(s => { s.style.color = Number(s.dataset.star) <= val ? "#facc15" : "#4b5563"; });
    });
    star.addEventListener("click", () => {
      ratingInput.value = star.dataset.star;
    });
  });

  modal.querySelector("#starRating").addEventListener("mouseleave", () => {
    const selected = Number(ratingInput.value);
    stars.forEach(s => { s.style.color = Number(s.dataset.star) <= selected ? "#facc15" : "#4b5563"; });
  });

  const closeModal = () => modal.remove();
  modal.querySelector("#btnCloseReview").addEventListener("click", closeModal);
  modal.querySelector("#btnCancelReview").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

  modal.querySelector("#btnSubmitReview").addEventListener("click", async () => {
    const rating  = Number(ratingInput.value);
    const comment = modal.querySelector("#reviewComment").value.trim();
    if (!rating) { alert("Please select a rating (1–5 stars)"); return; }

    const submitBtn = modal.querySelector("#btnSubmitReview");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    try {
      await Review.create({
        request_id:  requestId,
        reviewer_id: getCustomerId(),
        seller_id:   sellerId,
        rating,
        comment:     comment || null,
      });
      closeModal();
      await loadRequests();
    } catch (err) {
      alert("Error: " + err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  });
}

async function loadRequests() {
  try {
    _allRequests = await Requests.getByIdCustomer(getCustomerId());
    renderList(_allRequests);
  } catch {
    const list = document.getElementById("requestList");
    if (list) list.innerHTML = `<p style="color:var(--clr-text-muted); text-align:center; padding:40px 0;">Failed to load data</p>`;
  }
}

async function loadServiceTypes() {
  try {
    const types = await serviceType.getAllServiceType();
    const select = document.getElementById("inputServiceType");
    if (!select) return;
    types.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.service_type_id;
      opt.textContent = t.name;
      select.appendChild(opt);
    });
  } catch { /* not critical */ }
}

function bindEvents() {
  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      _activeFilter = tab.dataset.status;
      renderList(_allRequests);
    });
  });

  document.getElementById("btnNewRequest")?.addEventListener("click", () => {
    document.getElementById("modalNewRequest")?.classList.add("active");
  });

  document.getElementById("btnCancelRequest")?.addEventListener("click", closeNewRequestModal);
  document.getElementById("modalNewRequest")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeNewRequestModal();
  });

  document.getElementById("btnSubmitRequest")?.addEventListener("click", submitRequest);
}

function closeNewRequestModal() {
  document.getElementById("modalNewRequest")?.classList.remove("active");
  document.getElementById("inputTitle").value = "";
  document.getElementById("inputDetail").value = "";
  document.getElementById("inputBudget").value = "";
  document.getElementById("inputServiceType").value = "";
}

async function submitRequest() {
  const title           = document.getElementById("inputTitle")?.value.trim();
  const detail          = document.getElementById("inputDetail")?.value.trim();
  const budget          = document.getElementById("inputBudget")?.value;
  const service_type_id = document.getElementById("inputServiceType")?.value;

  if (!title || !service_type_id) {
    alert("Please fill in the title and select a service type");
    return;
  }

  try {
    await Requests.createRequest({
      request_title:  title,
      request_detail: detail,
      budget:         budget || 0,
      request_status: "WAITING",
      customer_id:    getCustomerId(),
      service_type_id,
    });
    closeNewRequestModal();
    await loadRequests();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

export const Booking = {
  init() {
    loadRequests();
    loadServiceTypes();
    bindEvents();
  }
};
