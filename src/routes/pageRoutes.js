import { Router } from "express";
import { join } from "path";
import { PAGES_DIR } from "../config/paths.js";

const router = Router();

const servePage = (page) => (req, res) => {
  res.sendFile(join(PAGES_DIR, page));
};

router.get("/",            servePage("index.html"));
router.get("/students",    servePage("students.html"));
router.get("/courses",     servePage("courses.html"));
router.get("/enrollments", servePage("enrollments.html"));
router.get("/reports",     servePage("reports.html"));

export default router;
