import { Router } from "express";
import * as ctrl from "../controllers/requestsController.js";

const router = Router();

router.get("/",       ctrl.getAll);
router.get("/:id",    ctrl.getById);
router.post("/",      ctrl.create);
router.put("/:id",    ctrl.update);
router.delete("/:id", ctrl.remove);

//router.get("/request/countSVT", ctrl.getCountServiceType);
//router.get("/request/customerReq", ctrl.getByCustomerId);
//router.put("/request/updateStatus", ctrl.updateStatus);



export default router;
