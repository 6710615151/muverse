import { Router } from "express";
import * as ctrl from "../controllers/usersController.js";

const router = Router();

router.post("/auth", ctrl.login);

router.put("/toggleRole/:id", ctrl.toggleRole);
router.patch("/status/:id", ctrl.updateStatus);
router.get("/me/:id", ctrl.getRole);


router.get("/", ctrl.getAll);
router.post("/", ctrl.create);



router.get("/:id", ctrl.getById);

router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);


export default router;
