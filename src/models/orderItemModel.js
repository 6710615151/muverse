import sql from "../config/db.js";

// --- Buy Digital Item ---

export async function createOrderItem(order_id, stock_id, item_quantity, unit_price) {
  const subtotal = item_quantity * parseFloat(unit_price);
  await sql`
    INSERT INTO order_items (order_id, stock_id, item_quantity, unit_price, subtotal)
    VALUES (${order_id}, ${stock_id}, ${item_quantity}, ${unit_price}, ${subtotal})
  `;
}

// --- Manage Order ---

export async function getOrderItemsByOrder(order_id) {
  return await sql`
    SELECT oi.*,
           s.item_name,
           s.item_type,
           s.description
    FROM order_items oi
    JOIN stocks s ON oi.stock_id = s.stock_id
    WHERE oi.order_id = ${order_id}
  `;
}
