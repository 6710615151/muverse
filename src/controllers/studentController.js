import * as StudentModel from "../models/studentModel.js";

export async function getAll(req, res) {
  try {
    const students = await StudentModel.getAllStudents();
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getOne(req, res) {
  try {
    const student = await StudentModel.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ success: false, error: "Student not found" });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function search(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: "Query parameter 'q' is required" });
    const students = await StudentModel.searchStudents(q);
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function create(req, res) {
  try {
    const { student_id, name, major, year } = req.body;
    if (!student_id || !name || !major || !year) {
      return res.status(400).json({ success: false, error: "All fields are required: student_id, name, major, year" });
    }
    const student = await StudentModel.createStudent(student_id, name, major, year);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    if (err.message.includes("duplicate key")) {
      return res.status(409).json({ success: false, error: "Student ID already exists" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function update(req, res) {
  try {
    const { name, major, year } = req.body;
    const student = await StudentModel.updateStudent(req.params.id, name, major, year);
    if (!student) return res.status(404).json({ success: false, error: "Student not found" });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const student = await StudentModel.deleteStudent(req.params.id);
    if (!student) return res.status(404).json({ success: false, error: "Student not found" });
    res.json({ success: true, data: student, message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function stats(req, res) {
  try {
    const [summary, byMajor] = await Promise.all([
      StudentModel.getStudentStats(),
      StudentModel.getStudentsByMajor(),
    ]);
    res.json({ success: true, data: { summary, byMajor } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
