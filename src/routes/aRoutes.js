import { Router } from "express";
import * as ctrl from "../controllers/aController";

const router = Router();
//มี fuctionอะไรใน contrllor บ้าง 
//ใส่ให้หมดคับเตง
// และก็ ความหมาย router.get(path url ที่จะใช้ ,       functionที่จะใช้);
router.get("/",       ctrl.getAll);
router.get("/:id",    ctrl.getById);
router.post("/",      ctrl.create);
router.put("/:id",    ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;