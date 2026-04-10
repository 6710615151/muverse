import * as CourseModel from "../models/courseModel.js";

export async function getAll(req, res) {
  try {
    const courses = await CourseModel.getAllCourses();
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getOne(req, res) {
  try {
    const course = await CourseModel.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function create(req, res) {
  try {
    const { course_id, course_name, credits, instructor, department } = req.body;
    if (!course_id || !course_name || !credits || !instructor || !department) {
      return res.status(400).json({ success: false, error: "All fields required: course_id, course_name, credits, instructor, department" });
    }
    const course = await CourseModel.createCourse(course_id, course_name, credits, instructor, department);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    if (err.message.includes("duplicate key")) {
      return res.status(409).json({ success: false, error: "Course ID already exists" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function update(req, res) {
  try {
    const { course_name, credits, instructor, department } = req.body;
    const course = await CourseModel.updateCourse(req.params.id, course_name, credits, instructor, department);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const course = await CourseModel.deleteCourse(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    res.json({ success: true, data: course, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function stats(req, res) {
  try {
    const summary = await CourseModel.getCourseStats();
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
