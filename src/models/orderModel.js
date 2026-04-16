import sql from "../config/db.js";

// --- Buy Digital Item ---

export async function createOrder(customer_id, seller_id, total_price) {
  const result = await sql`
    INSERT INTO orders (customer_id, seller_id, total_price, order_status, payment_status)
    VALUES (${customer_id}, ${seller_id}, ${total_price}, 'pending', 'unpaid')
    RETURNING order_id
  `;
  return result[0].order_id;
}

// --- Manage Order (Seller) ---

export async function getOrdersBySeller(seller_id) {
  return await sql`
    SELECT o.*,
           u.name AS customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN users u ON c.user_id = u.user_id
    WHERE o.seller_id = ${seller_id}
    ORDER BY o.order_date DESC
  `;
}

export async function updateOrderStatus(order_id, order_status) {
  await sql`
    UPDATE orders
    SET order_status = ${order_status}
    WHERE order_id = ${order_id}
  `;
}

export async function updatePaymentStatus(order_id, payment_status) {
  await sql`
    UPDATE orders
    SET payment_status = ${payment_status}
    WHERE order_id = ${order_id}
  `;
}

// --- Buyer ---

export async function getOrdersByCustomer(customer_id) {
  return await sql`
    SELECT o.*,
           u.name AS seller_name
    FROM orders o
    JOIN sellers s ON o.seller_id = s.seller_id
    JOIN users u ON s.user_id = u.user_id
    WHERE o.customer_id = ${customer_id}
    ORDER BY o.order_date DESC
  `;
}

export async function getOrderById(order_id) {
  const result = await sql`
    SELECT * FROM orders
    WHERE order_id = ${order_id}
  `;
  return result[0] || null;
}
