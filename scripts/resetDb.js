import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function resetDb() {
  console.log("⚠️  Resetting database (DROP + RECREATE)...\n");

  await sql`DROP TABLE IF EXISTS enrollments CASCADE`;
  await sql`DROP TABLE IF EXISTS students    CASCADE`;
  await sql`DROP TABLE IF EXISTS courses     CASCADE`;
  console.log("🗑️  All tables dropped");

  // Re-run init
  const { default: init } = await import("./initDb.js");
}

resetDb().catch((err) => {
  console.error("❌ Reset failed:", err.message);
  process.exit(1);
});
