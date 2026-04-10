import { Router } from "express";
import * as ctrl from "../controllers/studentController.js";

const router = Router();

router.get("/stats",    ctrl.stats);
router.get("/search",   ctrl.search);
router.get("/",         ctrl.getAll);
router.get("/:id",      ctrl.getOne);
router.post("/",        ctrl.create);
router.put("/:id",      ctrl.update);
router.delete("/:id",   ctrl.remove);

export default router;
