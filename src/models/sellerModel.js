import sql from "../config/db.js";

export async function getUserSeller() {
  return await sql`
    SELECT 
      u.user_id,
      c.customer_id
    FROM users u
    JOIN customers c 
      ON u.user_id = c.user_id
  `;
}

export async function getSellerByUserId(userId) {
  return await sql`
    SELECT customer_id
    FROM customers
    WHERE user_id = ${userId}
  `;
}