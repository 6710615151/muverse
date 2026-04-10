import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function initDb() {
  console.log("🔧 Initializing database...");

  // Students table
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
  console.log("✅ Table: students");

  // Courses table
  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      course_id   VARCHAR(20) PRIMARY KEY,
      course_name VARCHAR(150) NOT NULL,
      credits     INTEGER NOT NULL CHECK (credits BETWEEN 1 AND 6),
      instructor  VARCHAR(100) NOT NULL,
      department  VARCHAR(100) NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("✅ Table: courses");

  // Enrollments table with composite unique constraint
  await sql`
    CREATE TABLE IF NOT EXISTS enrollments (
      id          SERIAL PRIMARY KEY,
      student_id  VARCHAR(20) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
      course_id   VARCHAR(20) NOT NULL REFERENCES courses(course_id)   ON DELETE CASCADE,
      semester    VARCHAR(20) NOT NULL,
      grade       VARCHAR(2)  CHECK (grade IN ('A','B+','B','C+','C','D+','D','F','W','I')),
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (student_id, course_id, semester)
    )
  `;
  console.log("✅ Table: enrollments");

  // Indexes for performance
  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_course  ON enrollments(course_id)`;
  console.log("✅ Indexes created");

  console.log("\n🎉 Database initialized successfully!");
}

initDb().catch((err) => {
  console.error("❌ Init failed:", err.message);
  process.exit(1);
});
