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
    SELECT seller_id, user_id, shop_name, rating, seller_status
    FROM sellers
    ORDER BY seller_id ASC
  `;
}

export async function getSellerById(seller_id) {
  const result = await sql`
    SELECT seller_id, user_id, shop_name, rating, seller_status
    FROM sellers
    WHERE seller_id = ${seller_id}
  `;
  return result[0] || null;
}

export async function verifySeller(seller_id, seller_status) {
  const result = await sql`
    UPDATE sellers
    SET seller_status = ${seller_status}
    WHERE seller_id = ${seller_id}
    RETURNING seller_id, shop_name, seller_status
  `;
  return result[0] || null;
}

export async function createSellerIfNotExists(userId) {
  const existing = await sql`SELECT seller_id, user_id, shop_name, seller_status FROM sellers WHERE user_id = ${userId}`;
  if (existing.length) return existing[0];
  const result = await sql`
    INSERT INTO sellers (user_id, shop_name, rating, seller_status)
    VALUES (${userId}, 'My Shop', 0, 'unverified')
    RETURNING seller_id, user_id, shop_name, seller_status
  `;
  return result[0] || null;
}

export async function updateSellerRating(seller_id) {
  const result = await sql`
    UPDATE sellers
    SET rating = COALESCE(
      (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE seller_id = ${seller_id}),
      0
    )
    WHERE seller_id = ${seller_id}
    RETURNING seller_id, rating
  `;
  return result[0] || null;
}

export async function checkSellerExists(userId) {
  const result = await sql`
    SELECT seller_id
    FROM sellers
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  return result.length > 0;
}