import sql from "../config/db.js";

export async function createUser(name , email , password_hash,phone) {
  await sql`
    INSERT INTO users (name, email, password_hash, phone)
    VALUES (${name}, ${email}, ${password_hash}, ${phone})
  `;
}

export async function getAllUsers() {
  return await sql`
    SELECT * FROM users
    ORDER BY course_id ASC
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
        -phone = ${phone},
    WHERE user_id = ${userId}
    RETURNING *
  `;
  return result[0] || null;
}

export async function deleteUser(User_id) {
  const result = await sql`
    DELETE FROM usesrs
    WHERE user_id = ${User_id}
    RETURNING *
  `;
  return result[0] || null;
}
