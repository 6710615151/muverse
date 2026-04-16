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
