import sql from "../config/db.js";

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function enrollStudent(student_id, course_id, semester, grade) {
  const result = await sql`
    INSERT INTO enrollments (student_id, course_id, semester, grade)
    VALUES (${student_id}, ${course_id}, ${semester}, ${grade ?? null})
    RETURNING *
  `;
  return result[0];
}

// ─── READ ─────────────────────────────────────────────────────────────────────

export async function getAllEnrollments() {
  return await sql`
    SELECT
      e.id,
      e.student_id,
      s.name AS student_name,
      e.course_id,
      c.course_name,
      c.credits,
      e.semester,
      e.grade,
      e.enrolled_at
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    JOIN courses  c ON e.course_id  = c.course_id
    ORDER BY e.enrolled_at DESC
  `;
}

export async function getEnrollmentsByStudent(student_id) {
  return await sql`
    SELECT
      e.id,
      e.course_id,
      c.course_name,
      c.credits,
      c.instructor,
      e.semester,
      e.grade
    FROM enrollments e
    JOIN courses c ON e.course_id = c.course_id
    WHERE e.student_id = ${student_id}
    ORDER BY e.semester DESC
  `;
}

export async function getEnrollmentsByCourse(course_id) {
  return await sql`
    SELECT
      e.id,
      e.student_id,
      s.name AS student_name,
      s.major,
      e.semester,
      e.grade
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    WHERE e.course_id = ${course_id}
    ORDER BY s.name ASC
  `;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateGrade(id, grade) {
  const result = await sql`
    UPDATE enrollments
    SET grade = ${grade}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] || null;
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteEnrollment(id) {
  const result = await sql`
    DELETE FROM enrollments
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] || null;
}

// ─── ADVANCED SQL QUERIES ─────────────────────────────────────────────────────

export async function getGPAByStudent() {
  return await sql`
    SELECT
      s.student_id,
      s.name,
      s.major,
      COUNT(e.id) AS courses_taken,
      ROUND(AVG(
        CASE e.grade
          WHEN 'A'  THEN 4.0
          WHEN 'B+' THEN 3.5
          WHEN 'B'  THEN 3.0
          WHEN 'C+' THEN 2.5
          WHEN 'C'  THEN 2.0
          WHEN 'D+' THEN 1.5
          WHEN 'D'  THEN 1.0
          WHEN 'F'  THEN 0.0
          ELSE NULL
        END
      ), 2) AS gpa
    FROM students s
    LEFT JOIN enrollments e ON s.student_id = e.student_id
    GROUP BY s.student_id, s.name, s.major
    ORDER BY gpa DESC NULLS LAST
  `;
}

export async function getTopStudentsByCourse() {
  return await sql`
    SELECT
      c.course_id,
      c.course_name,
      COUNT(e.student_id) AS enrolled_count,
      SUM(CASE WHEN e.grade = 'A' THEN 1 ELSE 0 END) AS grade_a_count
    FROM courses c
    LEFT JOIN enrollments e ON c.course_id = e.course_id
    GROUP BY c.course_id, c.course_name
    ORDER BY enrolled_count DESC
  `;
}

export async function getEnrollmentStats() {
  const result = await sql`
    SELECT
      COUNT(*) AS total_enrollments,
      COUNT(DISTINCT student_id) AS students_enrolled,
      COUNT(DISTINCT course_id) AS courses_active,
      COUNT(CASE WHEN grade IS NOT NULL THEN 1 END) AS graded_count
    FROM enrollments
  `;
  return result[0];
}
