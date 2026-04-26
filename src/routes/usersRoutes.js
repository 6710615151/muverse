import { Router } from "express";
import * as ctrl from "../controllers/usersController.js";

const router = Router();

router.get("/",       ctrl.getAll);
router.get("/:id",    ctrl.getById);
router.post("/",      ctrl.create);
router.put("/:id",    ctrl.update);
router.delete("/:id", ctrl.remove);
router.post("/auth", ctrl.login);
router.put("/toggleRole/:id", ctrl.toggleRole);
router.patch("/status/:id", ctrl.updateStatus);
router.get("/me/:id" , ctrl.getRole);

export default router;
