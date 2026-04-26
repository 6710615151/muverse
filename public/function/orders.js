import { Order } from "./api.js";

const getUserId = () => localStorage.getItem("user_id");

const STATUS_LABEL = {
  pending:   "Pending",
  shipped:   "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_CLASS = {
  pending:   "status-badge--pending",
  shipped:   "status-badge--accepted",
  completed: "status-badge--done",
  cancelled: "status-badge--rejected",
};

let _allOrders = [];
let _activeFilter = "all";

function orderCard(order) {
  const statusClass = STATUS_CLASS[order.order_status] || "status-badge--pending";
  const statusLabel = STATUS_LABEL[order.order_status] || order.order_status;
  const d = new Date(order.order_date);
  const day   = d.getDate();
  const month = d.toLocaleString("th-TH", { month: "short" });
  const total = Number(order.total_price).toLocaleString("th-TH");

  const canConfirm = order.order_status === "shipped";

  return `
    <div class="booking-item booking-item--${order.order_status}">
      <div class="booking-item__accent"></div>
      <div class="booking-item__date">
        <span class="booking-item__day">${day}</span>
        <span class="booking-item__month">${month}</span>
      </div>
      <div class="booking-item__info">
        <div class="booking-item__name">Order #${order.order_id}</div>
        <div class="booking-item__meta">
          <span class="booking-item__detail-text">Seller: ${order.seller_name || "-"}</span>
          <span class="booking-item__budget">฿${total}</span>
        </div>
        <span style="font-size:0.78rem;color:var(--clr-text-muted)">
          Payment: ${order.payment_status}
        </span>
      </div>
      <div class="booking-item__actions">
        <span class="status-badge ${statusClass}">${statusLabel}</span>
        ${canConfirm ? `
          <button class="btn btn--primary btn--sm btn-confirm-receipt"
            data-id="${order.order_id}"
            style="margin-left:8px">
            ยืนยันรับสินค้า
          </button>` : ""}
      </div>
    </div>
  `;
}

const ORDER_PRIORITY = { pending: 0, shipped: 1, completed: 2, cancelled: 3 };

function sortOrders(orders) {
  return [...orders].sort((a, b) =>
    (ORDER_PRIORITY[a.order_status] ?? 9) - (ORDER_PRIORITY[b.order_status] ?? 9)
  );
}

function renderOrders() {
  const list = document.getElementById("orderList");
  if (!list) return;

  const filtered = sortOrders(_activeFilter === "all"
    ? _allOrders
    : _allOrders.filter(o => o.order_status === _activeFilter));

  if (!filtered.length) {
    list.innerHTML = `<p style="color:var(--clr-text-muted);text-align:center;padding:40px 0;">No orders found</p>`;
    return;
  }

  list.innerHTML = filtered.map(orderCard).join("");

  list.querySelectorAll(".btn-confirm-receipt").forEach(btn => {
    btn.addEventListener("click", () => handleConfirmReceipt(btn.dataset.id));
  });
}

async function handleConfirmReceipt(orderId) {
  if (!confirm("ยืนยันว่าได้รับสินค้าแล้ว? ระบบจะโอนเงินให้ผู้ขาย")) return;

  try {
    await Order.confirmReceipt(orderId);
    alert("ยืนยันรับสินค้าสำเร็จ!");
    await loadOrders();
    window.WalletFlow?.loadBalance?.();
  } catch (err) {
    alert("เกิดข้อผิดพลาด: " + err.message);
  }
}

async function loadOrders() {
  const list = document.getElementById("orderList");
  try {
    _allOrders = await Order.getByCustomer(getUserId());
    renderOrders();
  } catch {
    if (list) list.innerHTML = `<p style="color:var(--clr-text-muted);text-align:center;padding:40px 0;">Failed to load orders</p>`;
  }
}

function bindEvents() {
  document.querySelectorAll("#order-filter-tabs .filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("#order-filter-tabs .filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      _activeFilter = tab.dataset.status;
      renderOrders();
    });
  });
}

export const Orders = {
  init() {
    loadOrders();
    bindEvents();
  },
};
