import sql from "../config/db.js";

export async function createUser(name , email , password_hash,phone) {
  return await sql`
  INSERT INTO users (name, email, password_hash, phone)
  VALUES (${name}, ${email}, ${password_hash}, ${phone})
  RETURNING *
`;

}

export async function getAllUsers() {
  return await sql`
    SELECT * FROM users
    ORDER BY user_id ASC
  `;
}

export async function getUserById(user_id) {
  const result = await sql`
    SELECT * FROM users
    WHERE user_id = ${user_id}
  `;
  return result[0] || null;
}

export async function updateUser(userId, name, email, password,phone) {
  const result = await sql`
    UPDATE users
    SET name = ${name},
        email = ${email},
        password_hash = ${password},
        phone = ${phone}
    WHERE user_id = ${userId}
    RETURNING *
  `;
  return result[0] || null;
}

export async function deleteUser(user_id) {
  await sql`DELETE FROM record_wallet WHERE account_id IN (SELECT account_id FROM account_wallet WHERE user_id = ${user_id})`;
  await sql`DELETE FROM account_wallet WHERE user_id = ${user_id}`;
  await sql`DELETE FROM order_items WHERE order_id IN (SELECT order_id FROM orders WHERE customer_id = ${user_id} OR seller_id = ${user_id})`;
  await sql`DELETE FROM orders WHERE customer_id = ${user_id} OR seller_id = ${user_id}`;
  await sql`DELETE FROM stocks WHERE seller_id IN (SELECT seller_id FROM sellers WHERE user_id = ${user_id})`;
  await sql`DELETE FROM sellers WHERE user_id = ${user_id}`;
  await sql`DELETE FROM customers WHERE user_id = ${user_id}`;
  const result = await sql`DELETE FROM users WHERE user_id = ${user_id} RETURNING *`;
  return result[0] || null;
}

export async function getUserByEmail(email) {
    const users = await sql`
        SELECT * FROM users WHERE email = ${email}
    `;

    return users[0];
}

export async function getRoleById(userId) {
  return await sql`
    SELECT role
    FROM users
    WHERE user_id = ${userId}
  `;
}

export async function updateUserStatus(userId, status) {
  const result = await sql`
    UPDATE users SET status = ${status}
    WHERE user_id = ${userId}
    RETURNING user_id, status
  `;
  return result[0] || null;
}

export async function changeRole(userId) {
  return await sql`
    UPDATE users
    SET role = CASE
      WHEN role = 'customer' THEN 'seller'
      WHEN role = 'seller' THEN 'customer'
      ELSE role
    END
    WHERE user_id = ${userId}
    RETURNING user_id, role
  `;
}