import sql from "../config/db.js";

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createStudent(student_id, name, major, year) {
  const result = await sql`
    INSERT INTO students (student_id, name, major, year)
    VALUES (${student_id}, ${name}, ${major}, ${year})
    RETURNING *
  `;
  return result[0];
}

// ─── READ ─────────────────────────────────────────────────────────────────────

export async function getAllStudents() {
  return await sql`
    SELECT * FROM students
    ORDER BY student_id ASC
  `;
}

export async function getStudentById(student_id) {
  const result = await sql`
    SELECT * FROM students
    WHERE student_id = ${student_id}
  `;
  return result[0] || null;
}

export async function searchStudents(query) {
  return await sql`
    SELECT * FROM students
    WHERE name ILIKE ${"%" + query + "%"}
       OR major ILIKE ${"%" + query + "%"}
       OR student_id::text ILIKE ${"%" + query + "%"}
    ORDER BY student_id ASC
  `;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateStudent(student_id, name, major, year) {
  const result = await sql`
    UPDATE students
    SET name = ${name},
        major = ${major},
        year = ${year},
        updated_at = CURRENT_TIMESTAMP
    WHERE student_id = ${student_id}
    RETURNING *
  `;
  return result[0] || null;
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteStudent(student_id) {
  const result = await sql`
    DELETE FROM students
    WHERE student_id = ${student_id}
    RETURNING *
  `;
  return result[0] || null;
}

// ─── STATS ────────────────────────────────────────────────────────────────────

export async function getStudentStats() {
  const result = await sql`
    SELECT
      COUNT(*) AS total_students,
      COUNT(DISTINCT major) AS total_majors,
      ROUND(AVG(year), 1) AS avg_year
    FROM students
  `;
  return result[0];
}

export async function getStudentsByMajor() {
  return await sql`
    SELECT major, COUNT(*) AS count
    FROM students
    GROUP BY major
    ORDER BY count DESC
  `;
}
