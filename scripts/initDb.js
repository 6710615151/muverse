import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function initDb() {
  console.log("Initializing database...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(20) NOT NULL DEFAULT 'customer',
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("Table users created");

  await sql`
    CREATE TABLE IF NOT EXISTS account_wallet (
      account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      wallet NUMERIC(12,2) NOT NULL DEFAULT 0.00
    )
  `;
  console.log("Table account_wallet created");

  await sql`
    DO $$ BEGIN
      CREATE TYPE payment_type_enum AS ENUM ('DEPOSIT', 'WITHDRAW', 'PAYMENT', 'INCOME', 'REFUND');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS record_wallet (
      record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id UUID NOT NULL REFERENCES account_wallet(account_id) ON DELETE CASCADE,
      payment_type payment_type_enum NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      payment_method VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("Table record_wallet created");

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      customer_status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("Table customers created");

  await sql`
    CREATE TABLE IF NOT EXISTS sellers (
      seller_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      shop_name VARCHAR(255),
      rating NUMERIC(3,2) NOT NULL DEFAULT 0,
      seller_status VARCHAR(20) NOT NULL DEFAULT 'unverified',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("Table sellers created");

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL
    )
  `;
  console.log("Table categories created");

  await sql`
    CREATE TABLE IF NOT EXISTS service_types (
      service_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL
    )
  `;
  console.log("Table service_types created");

  await sql`
    CREATE TABLE IF NOT EXISTS stocks (
      stock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id UUID NOT NULL REFERENCES sellers(seller_id) ON DELETE CASCADE,
      category_id UUID REFERENCES categories(category_id) ON DELETE SET NULL,
      item_name VARCHAR(200) NOT NULL,
      description TEXT,
      price NUMERIC(12,2) NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      item_type VARCHAR(50) NOT NULL DEFAULT 'physical',
      stock_status VARCHAR(20) NOT NULL DEFAULT 'available',
      url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("Table stocks created");

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES users(user_id),
      seller_id UUID NOT NULL REFERENCES users(user_id),
      order_date TIMESTAMP NOT NULL DEFAULT NOW(),
      total_price NUMERIC(12,2) NOT NULL,
      order_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid'
    )
  `;
  console.log("Table orders created");

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      stock_id UUID NOT NULL REFERENCES stocks(stock_id),
      item_quantity INTEGER NOT NULL DEFAULT 1,
      unit_price NUMERIC(12,2) NOT NULL,
      subtotal NUMERIC(12,2) NOT NULL
    )
  `;
  console.log("Table order_items created");

  await sql`
    CREATE TABLE IF NOT EXISTS requests (
      request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES users(user_id),
      seller_id UUID REFERENCES users(user_id),
      service_type_id UUID REFERENCES service_types(service_type_id) ON DELETE SET NULL,
      request_title VARCHAR(255) NOT NULL,
      request_detail TEXT,
      budget NUMERIC(12,2) NOT NULL DEFAULT 0.00,
      locked_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
      request_status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("Table requests created");

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      request_id UUID REFERENCES requests(request_id) ON DELETE SET NULL,
      reviewer_id UUID NOT NULL REFERENCES users(user_id),
      seller_id UUID NOT NULL REFERENCES sellers(seller_id),
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("Table reviews created");

  console.log("\nDatabase initialized successfully!");
}

initDb().catch((err) => {
  console.error("Init failed:", err.message);
  process.exit(1);
});
