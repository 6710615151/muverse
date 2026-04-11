import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function initDb() {
  console.log("Initializing database...");

  await sql`
    CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
  `;
  console.log("Table complete");
  console.log("Indexes created");

  console.log("\n Database initialized successfully!");
}

initDb().catch((err) => {
  console.error("Init failed:", err.message);
  process.exit(1);
});
