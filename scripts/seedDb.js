import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const List = [
  "ข้อมูล"
];

async function seedDb() {
  console.log("Seeding database...\n");

  // Students
  for (const s of List) {
    await sql`
      INSERT 
    `;
  }
  console.log("\nSeed complete!");
}

seedDb().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
