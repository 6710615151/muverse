import * as EnrollmentModel from "../models/enrollmentModel.js";

export async function getAll(req, res) {
  try {
    const enrollments = await EnrollmentModel.getAllEnrollments();
    res.json({ success: true, data: enrollments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getByStudent(req, res) {
  try {
    const enrollments = await EnrollmentModel.getEnrollmentsByStudent(req.params.studentId);
    res.json({ success: true, data: enrollments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getByCourse(req, res) {
  try {
    const enrollments = await EnrollmentModel.getEnrollmentsByCourse(req.params.courseId);
    res.json({ success: true, data: enrollments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function enroll(req, res) {
  try {
    const { student_id, course_id, semester, grade } = req.body;
    if (!student_id || !course_id || !semester) {
      return res.status(400).json({ success: false, error: "Required: student_id, course_id, semester" });
    }
    const enrollment = await EnrollmentModel.enrollStudent(student_id, course_id, semester, grade);
    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    if (err.message.includes("duplicate key")) {
      return res.status(409).json({ success: false, error: "Student already enrolled in this course for this semester" });
    }
    if (err.message.includes("foreign key")) {
      return res.status(400).json({ success: false, error: "Invalid student_id or course_id" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateGrade(req, res) {
  try {
    const { grade } = req.body;
    const VALID_GRADES = ["A", "B+", "B", "C+", "C", "D+", "D", "F", "W", "I"];
    if (!VALID_GRADES.includes(grade)) {
      return res.status(400).json({ success: false, error: `Grade must be one of: ${VALID_GRADES.join(", ")}` });
    }
    const enrollment = await EnrollmentModel.updateGrade(req.params.id, grade);
    if (!enrollment) return res.status(404).json({ success: false, error: "Enrollment not found" });
    res.json({ success: true, data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const enrollment = await EnrollmentModel.deleteEnrollment(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, error: "Enrollment not found" });
    res.json({ success: true, data: enrollment, message: "Enrollment removed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function gpaReport(req, res) {
  try {
    const data = await EnrollmentModel.getGPAByStudent();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function courseReport(req, res) {
  try {
    const data = await EnrollmentModel.getTopStudentsByCourse();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function stats(req, res) {
  try {
    const data = await EnrollmentModel.getEnrollmentStats();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
