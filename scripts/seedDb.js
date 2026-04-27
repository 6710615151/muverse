import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function seedDb() {
  console.log("Seeding database...\n");

  // 1. Users
  const [nut] = await sql`
    INSERT INTO users (name, email, password_hash, phone, role, status)
    VALUES ('NUT', 'somchai@example.com', 'a123', '0812345678', 'customer', 'active')
    RETURNING user_id
  `;
  const [gj] = await sql`
    INSERT INTO users (name, email, password_hash, phone, role, status)
    VALUES ('GJ', 'somying@example.com', 'b456', '0898765432', 'seller', 'active')
    RETURNING user_id
  `;
  const [fan] = await sql`
    INSERT INTO users (name, email, password_hash, phone, role, status)
    VALUES ('FAN', 'admin@muverse.com', '$c789', '0800000001', 'admin', 'active')
    RETURNING user_id
  `;
  console.log("Users seeded");

  // 2. Categories
  const [cat1] = await sql`
    INSERT INTO categories (name) VALUES ('วอลเลตเกมออนไลน์') RETURNING category_id
  `;
  const [cat2] = await sql`
    INSERT INTO categories (name) VALUES ('บริการรับทำคิวมี') RETURNING category_id
  `;
  console.log("Categories seeded");

  // 3. Sellers (GJ เป็น seller)
  const [seller1] = await sql`
    INSERT INTO sellers (user_id, shop_name, rating, seller_status)
    VALUES (${gj.user_id}, 'ร้านมูเบลู GJ', 4.50, 'verified')
    RETURNING seller_id
  `;
  console.log("Sellers seeded");

  // 4. Account Wallets
  const [wallet1] = await sql`
    INSERT INTO account_wallet (user_id, wallet)
    VALUES (${nut.user_id}, 500.00)
    RETURNING account_id
  `;
  const [wallet2] = await sql`
    INSERT INTO account_wallet (user_id, wallet)
    VALUES (${fan.user_id}, 1200.00)
    RETURNING account_id
  `;
  console.log("Account wallets seeded");

  // 5. Stocks
  await sql`
    INSERT INTO stocks (seller_id, category_id, item_name, description, price, stock_quantity, stock_status)
    VALUES
      (${seller1.seller_id}, ${cat1.category_id}, 'วอลเลตมั่นครองชีพ', 'ภาพมงคลส่งเสริมดวง', 99.00, 999, 'available'),
      (${seller1.seller_id}, ${cat2.category_id}, 'บุกนิติกรรมตรวจสอบออนไลน์', 'รับต่างด้านงาน 1 ครั้ง', 250.00, 50, 'available')
  `;
  console.log("Stocks seeded");

  // 6. Record Wallet
  await sql`
    INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status)
    VALUES
      (${wallet1.account_id}, 'DEPOSIT', 500.00, 'PromptPay', 'SUCCESS'),
      (${wallet2.account_id}, 'PAYMENT', 99.00, 'wallet', 'SUCCESS'),
      (${wallet2.account_id}, 'DEPOSIT', 1200.00, 'Credit Card', 'SUCCESS')
  `;
  console.log("Record wallet seeded");

  console.log("\nSeed complete!");
}

seedDb().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
