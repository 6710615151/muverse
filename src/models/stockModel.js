import sql from "../config/db.js";

// --- Digital Item Admin ---

export async function createStock(seller_id, category_id, item_name, description, price, stock_quantity, item_type, stock_status) {
  await sql`
    INSERT INTO stocks (seller_id, category_id, item_name, description, price, stock_quantity, item_type, stock_status)
    VALUES (${seller_id}, ${category_id}, ${item_name}, ${description}, ${price}, ${stock_quantity}, ${item_type}, ${stock_status})
  `;
}

export async function updateStock(stock_id, category_id, item_name, description, price, stock_quantity, item_type, stock_status) {
  await sql`
    UPDATE stocks
    SET category_id     = ${category_id},
        item_name       = ${item_name},
        description     = ${description},
        price           = ${price},
        stock_quantity  = ${stock_quantity},
        item_type       = ${item_type},
        stock_status    = ${stock_status}
    WHERE stock_id = ${stock_id}
  `;
}

export async function deleteStock(stock_id) {
  await sql`
    DELETE FROM stocks WHERE stock_id = ${stock_id}
  `;
}

export async function getStocksBySeller(seller_id) {
  return await sql`
    SELECT s.*, c.name AS category_name
    FROM stocks s
    JOIN categories c ON s.category_id = c.category_id
    WHERE s.seller_id = ${seller_id}
    ORDER BY s.created_at DESC
  `;
}

// --- Market ---

export async function getAllStocks() {
  return await sql`
    SELECT s.*, c.name AS category_name
    FROM stocks s
    JOIN categories c ON s.category_id = c.category_id
    WHERE s.stock_status = 'available'
    ORDER BY s.created_at DESC
  `;
}

export async function getStockById(stock_id) {
  const result = await sql`
    SELECT s.*, c.name AS category_name
    FROM stocks s
    JOIN categories c ON s.category_id = c.category_id
    WHERE s.stock_id = ${stock_id}
  `;
  return result[0] || null;
}

export async function getStocksByCategory(category_id) {
  return await sql`
    SELECT s.*, c.name AS category_name
    FROM stocks s
    JOIN categories c ON s.category_id = c.category_id
    WHERE s.category_id = ${category_id}
      AND s.stock_status = 'available'
    ORDER BY s.created_at DESC
  `;
}

// --- Internal (used when buying) ---

export async function updateStockQuantity(stock_id, quantity) {
  await sql`
    UPDATE stocks
    SET stock_quantity = stock_quantity - ${quantity}
    WHERE stock_id = ${stock_id}
      AND stock_quantity >= ${quantity}
  `;
}
