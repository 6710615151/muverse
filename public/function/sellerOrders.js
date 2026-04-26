import { Order } from "./api.js";

const getSellerId = () => localStorage.getItem("user_id");

const ORDER_PRIORITY = { pending: 0, shipped: 1, completed: 2, cancelled: 3 };

function sortOrders(orders) {
  return [...orders].sort((a, b) =>
    (ORDER_PRIORITY[a.order_status] ?? 9) - (ORDER_PRIORITY[b.order_status] ?? 9)
  );
}

const STATUS_LABEL = {
  pending:   "Pending",
  shipped:   "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_CLASS = {
  pending:   "badge pending",
  shipped:   "badge accepted",
  completed: "badge done",
  cancelled: "badge rejected",
};

let _allOrders = [];
let _activeFilter = "all";

function orderCard(order) {
  const statusClass = STATUS_CLASS[order.order_status] || "badge pending";
  const statusLabel = STATUS_LABEL[order.order_status] || order.order_status;
  const d = new Date(order.order_date);
  const day   = d.getDate();
  const month = d.toLocaleString("th-TH", { month: "short" });
  const total = Number(order.total_price).toLocaleString("th-TH");

  const canShip = order.order_status === "pending";

  return `
    <div class="booking-card booking-card--${order.order_status}" data-id="${order.order_id}">
      <div class="booking-card__top-bar"></div>
      <div class="booking-card__header">
        <div class="booking-card__title-group">
          <span class="booking-card__title">Order #${order.order_id}</span>
          <span class="booking-card__customer">👤 ${order.customer_name || "Customer"}</span>
        </div>
        <span class="${statusClass}">${statusLabel}</span>
      </div>
      <div class="booking-card__meta">
        <span class="booking-card__meta-chip"><span class="fi fi-ts-calendar-clock"></span> ${day} ${month}</span>
        <span class="booking-card__meta-chip"><span class="fi fi-ts-sack-dollar"></span> ฿${total}</span>
        <span class="booking-card__meta-chip"><span class="fi fi-ts-credit-card"></span> ${order.payment_status}</span>
      </div>
      ${canShip ? `
        <div class="booking-card__actions">
          <button class="btn btn--primary btn-ship"
            data-id="${order.order_id}">
            Mark as Shipped
          </button>
        </div>` : ""}
    </div>
  `;
}

function renderOrders() {
  const list = document.getElementById("sellerOrderList");
  if (!list) return;

  const filtered = sortOrders(_activeFilter === "all"
    ? _allOrders
    : _allOrders.filter(o => o.order_status === _activeFilter));

  if (!filtered.length) {
    list.innerHTML = `<p style="color:var(--clr-text-muted);text-align:center;padding:40px 0;">No orders found.</p>`;
    return;
  }

  list.innerHTML = filtered.map(orderCard).join("");

  list.querySelectorAll(".btn-ship").forEach(btn => {
    btn.addEventListener("click", () => handleShip(btn.dataset.id, btn));
  });
}

async function handleShip(orderId, btn) {
  btn.disabled = true;
  try {
    await Order.updateOrderStatus(orderId, { order_status: "shipped" });
    await loadOrders();
  } catch (err) {
    alert("เกิดข้อผิดพลาด: " + err.message);
    btn.disabled = false;
  }
}

async function loadOrders() {
  const list = document.getElementById("sellerOrderList");
  try {
    _allOrders = await Order.getBySeller(getSellerId());
    renderOrders();
  } catch {
    if (list) list.innerHTML = `<p style="color:var(--clr-text-muted);text-align:center;padding:40px 0;">Failed to load orders.</p>`;
  }
}

function bindFilters() {
  document.querySelectorAll("#seller-order-filter-tabs .filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("#seller-order-filter-tabs .filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      _activeFilter = tab.dataset.status;
      renderOrders();
    });
  });
}

export const SellerOrders = {
  init() {
    loadOrders();
    bindFilters();
  },
};
