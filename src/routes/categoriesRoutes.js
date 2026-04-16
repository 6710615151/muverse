import { Router } from "express";
import * as ctrl from "../controllers/categoriesController.js";

const router = Router();

router.get("/",     ctrl.getAll);
router.get("/:id",  ctrl.getById);

export default router;
