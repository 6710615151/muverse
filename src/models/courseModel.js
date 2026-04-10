import sql from "../config/db.js";

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createCourse(course_id, course_name, credits, instructor, department) {
  const result = await sql`
    INSERT INTO courses (course_id, course_name, credits, instructor, department)
    VALUES (${course_id}, ${course_name}, ${credits}, ${instructor}, ${department})
    RETURNING *
  `;
  return result[0];
}

// ─── READ ─────────────────────────────────────────────────────────────────────

export async function getAllCourses() {
  return await sql`
    SELECT * FROM courses
    ORDER BY course_id ASC
  `;
}

export async function getCourseById(course_id) {
  const result = await sql`
    SELECT * FROM courses
    WHERE course_id = ${course_id}
  `;
  return result[0] || null;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateCourse(course_id, course_name, credits, instructor, department) {
  const result = await sql`
    UPDATE courses
    SET course_name = ${course_name},
        credits = ${credits},
        instructor = ${instructor},
        department = ${department},
        updated_at = CURRENT_TIMESTAMP
    WHERE course_id = ${course_id}
    RETURNING *
  `;
  return result[0] || null;
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteCourse(course_id) {
  const result = await sql`
    DELETE FROM courses
    WHERE course_id = ${course_id}
    RETURNING *
  `;
  return result[0] || null;
}

// ─── STATS ────────────────────────────────────────────────────────────────────

export async function getCourseStats() {
  const result = await sql`
    SELECT
      COUNT(*) AS total_courses,
      SUM(credits) AS total_credits,
      COUNT(DISTINCT department) AS total_departments
    FROM courses
  `;
  return result[0];
}
