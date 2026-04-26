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
    SELECT seller_id
    FROM sellers
    WHERE user_id = ${userId}
  `;
}

export async function getAllSellers() {
  return await sql`
    SELECT seller_id, shop_name
    FROM sellers
    ORDER BY seller_id ASC
  `;
}

export async function getSellerById(seller_id) {
  const result = await sql`
    SELECT seller_id, shop_name
    FROM sellers
    WHERE seller_id = ${seller_id}
  `;
  return result[0] || null;
}