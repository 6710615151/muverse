import { Requests, serviceType, Wallet } from "./api.js";

const getCustomerId = () => localStorage.getItem("user_id");

const STATUS_LABEL = {
  pending:   "Pending",
  accepted:  "Accepted",
  done:      "Done",
  complete:  "Complete",
};

const STATUS_CLASS = {
  pending:   "status-badge--pending",
  accepted:  "status-badge--accepted",
  done:      "status-badge--done",
  complete:  "status-badge--complete",
};

let _allRequests = [];
let _activeFilter = "all";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return { day: d.getDate(), month: d.toLocaleString("th-TH", { month: "short" }) };
}

function renderList(requests) {
  const list = document.getElementById("requestList");
  if (!list) return;

  const filtered = _activeFilter === "all"
    ? requests
    : requests.filter(r => r.request_status === _activeFilter);

  if (filtered.length === 0) {
    list.innerHTML = `<p style="color:var(--clr-text-muted); text-align:center; padding:40px 0;">No requests found</p>`;
    return;
  }

  list.innerHTML = filtered.map(r => {
    const { day, month } = formatDate(r.created_at);
    const statusClass = STATUS_CLASS[r.request_status] || "status-badge--pending";
    const statusLabel = STATUS_LABEL[r.request_status] || r.request_status;

    return `
      <div class="booking-item booking-item--${r.request_status}">
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
          ${r.request_status === "done" && r.seller_id
        ? `<button class="btn btn--primary btn--sm btn-pay-now"
                 data-id="${r.request_id}"
                 data-seller="${r.seller_id}"
                 data-amount="${r.budget || 0}"
                 data-title="${r.request_title}">
                 payment ฿${Number(r.budget || 0).toLocaleString()}
               </button>`
        : `<span class="status-badge ${statusClass}">${statusLabel}</span>`
      }
        </div>
      </div>
    `;
  }).join("");
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
  } catch { /* ไม่ critical */ }
}

function bindEvents() {
  // filter tabs
  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      _activeFilter = tab.dataset.status;
      renderList(_allRequests);
    });
  });

  // เปิด modal
  document.getElementById("btnNewRequest")?.addEventListener("click", () => {
    document.getElementById("modalNewRequest")?.classList.add("active");
  });

  // ปิด modal
  document.getElementById("btnCancelRequest")?.addEventListener("click", closeModal);
  document.getElementById("modalNewRequest")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // submit
  document.getElementById("btnSubmitRequest")?.addEventListener("click", submitRequest);

  // pay รอคนกดชำระเงิน
  document.getElementById("requestList")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-pay-now");
    if (!btn) return;
    handleServicePayment({
      id: btn.dataset.id,
      seller_id: btn.dataset.seller,
      amount: btn.dataset.amount,
      title: btn.dataset.title,
    });
  });
}

function closeModal() {
  document.getElementById("modalNewRequest")?.classList.remove("active");
  document.getElementById("inputTitle").value = "";
  document.getElementById("inputDetail").value = "";
  document.getElementById("inputBudget").value = "";
  document.getElementById("inputServiceType").value = "";
}

async function submitRequest() {
  const title = document.getElementById("inputTitle")?.value.trim();
  const detail = document.getElementById("inputDetail")?.value.trim();
  const budget = document.getElementById("inputBudget")?.value;
  const service_type_id = document.getElementById("inputServiceType")?.value;

  if (!title || !service_type_id) {
    alert("Please fill in the title and select a service type");
    return;
  }

  try {
    await Requests.createRequest({
      request_title: title,
      request_detail: detail,
      budget: budget || 0,
      request_status: "pending",
      customer_id: getCustomerId(),
      service_type_id,
    });
    closeModal();
    await loadRequests();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function handleServicePayment({ id, seller_id, amount, title }) {
  if (!confirm(`ยืนยันชำระเงิน ฿${Number(amount).toLocaleString()} สำหรับ "${title}"?`)) return;

  const customer_id = getCustomerId();

  try {
    await Wallet.transfer({
      customer_id,
      amount: Number(amount),
      seller_id,
      payment_method: "WALLET",
      description: `ชำระค่าบริการ: ${title}`,
    });

    await Requests.updateStatus(id, "complete");

    alert("ชำระเงินสำเร็จ!");
    await loadRequests();
    window.WalletFlow?.loadBalance?.();
  } catch (err) {
    alert("เกิดข้อผิดพลาด: " + err.message);
  }
}

export const Booking = {
  init() {
    loadRequests();
    loadServiceTypes();
    bindEvents();
  }
};
