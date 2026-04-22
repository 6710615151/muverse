import { Requests, Category } from "./api.js";

const CUSTOMER_ID = "temp-customer-id"; // TODO: เปลี่ยนเป็น id จาก auth

const STATUS_LABEL = {
  pending:  "Pending",
  accepted: "Accepted",
  done:     "Done",
};

const STATUS_CLASS = {
  pending:  "status-badge--pending",
  accepted: "status-badge--confirmed",
  done:     "status-badge--delivered",
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
      <div class="booking-item">
        <div class="booking-item__date">
          <span class="booking-item__day">${day}</span>
          <span class="booking-item__month">${month}</span>
        </div>
        <div class="booking-item__info">
          <div class="booking-item__name">${r.request_title}</div>
          <div class="booking-item__meta">${r.request_detail || "-"} · งบ ${Number(r.budget || 0).toLocaleString()} บาท</div>
        </div>
        <div class="booking-item__actions">
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
      </div>
    `;
  }).join("");
}

async function loadRequests() {
  try {
    _allRequests = await Requests.getByIdCustomer(CUSTOMER_ID);
    renderList(_allRequests);
  } catch {
    const list = document.getElementById("requestList");
    if (list) list.innerHTML = `<p style="color:var(--clr-text-muted); text-align:center; padding:40px 0;">Failed to load data</p>`;
  }
}

async function loadCategories() {
  try {
    const cats = await Category.getAll();
    const select = document.getElementById("inputCategory");
    if (!select) return;
    cats.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.category_id;
      opt.textContent = c.name;
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
}

function closeModal() {
  document.getElementById("modalNewRequest")?.classList.remove("active");
  document.getElementById("inputTitle").value = "";
  document.getElementById("inputDetail").value = "";
  document.getElementById("inputBudget").value = "";
  document.getElementById("inputCategory").value = "";
}

async function submitRequest() {
  const title    = document.getElementById("inputTitle")?.value.trim();
  const detail   = document.getElementById("inputDetail")?.value.trim();
  const budget   = document.getElementById("inputBudget")?.value;
  const category = document.getElementById("inputCategory")?.value;

  if (!title || !category) {
    alert("Please fill in the title and select a category");
    return;
  }

  try {
    await Requests.createRequest({
      request_title:  title,
      request_detail: detail,
      budget:         budget || 0,
      request_status: "pending",
      customer_id:    CUSTOMER_ID,
      category_id:    category,
    });
    closeModal();
    await loadRequests();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

export const Booking = {
  init() {
    loadRequests();
    loadCategories();
    bindEvents();
  }
};
