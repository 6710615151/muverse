import sql from "../config/db.js";

export async function getAllCategories() {
  return await sql`
    SELECT * FROM categories
    ORDER BY name ASC
  `;
}

export async function getCategoryById(category_id) {
  const result = await sql`
    SELECT * FROM categories
    WHERE category_id = ${category_id}
  `;
  return result[0] || null;
}

export async function createCategory(name) {
  const result = await sql`
    INSERT INTO categories (name)
    VALUES (${name})
    RETURNING *
  `;
  return result[0];
}

export async function deleteCategory(category_id) {
  const result = await sql`
    DELETE FROM categories
    WHERE category_id = ${category_id}
    RETURNING *
  `;
  return result[0] || null;
}
