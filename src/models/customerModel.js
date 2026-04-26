import sql from "../config/db.js";

export async function getUserCustomers() {
  return await sql`
    SELECT 
      u.user_id,
      c.customer_id
    FROM users u
    JOIN customers c 
      ON u.user_id = c.user_id
  `;
}

export async function getCustomerByUserId(userId) {
  return await sql`
    SELECT customer_id
    FROM customers
    WHERE user_id = ${userId}
  `;
}

export async function createCustomer(user_id) {
  if (!user_id) {
    throw new Error("Invalid user_id");
  }

  await sql`
    INSERT INTO customers (user_id)
    VALUES (${user_id})
  `;
}