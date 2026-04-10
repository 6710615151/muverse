import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function initDb() {
  console.log("Initializing database...");

  await sql`
    CREATE TABLE IF NOT EXISTS students (
      student_id  VARCHAR(20) PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      major       VARCHAR(100) NOT NULL,
      year        INTEGER NOT NULL CHECK (year BETWEEN 1 AND 6),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("Table complete");

  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id)`;
  console.log("Indexes created");

  console.log("\n Database initialized successfully!");
}

initDb().catch((err) => {
  console.error("Init failed:", err.message);
  process.exit(1);
});
