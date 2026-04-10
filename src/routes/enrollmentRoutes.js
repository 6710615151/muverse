import { Router } from "express";
import * as ctrl from "../controllers/enrollmentController.js";

const router = Router();

router.get("/stats",              ctrl.stats);
router.get("/reports/gpa",        ctrl.gpaReport);
router.get("/reports/courses",    ctrl.courseReport);
router.get("/student/:studentId", ctrl.getByStudent);
router.get("/course/:courseId",   ctrl.getByCourse);
router.get("/",                   ctrl.getAll);
router.post("/",                  ctrl.enroll);
router.patch("/:id/grade",        ctrl.updateGrade);
router.delete("/:id",             ctrl.remove);

export default router;
