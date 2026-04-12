import { Router } from "express";
import * as ctrl from "../controllers/aController.js"; // import ใหม่

const router = Router();
//มี fuctionอะไรใน contrllor บ้าง 
//ใส่ให้หมดคับเตง
// และก็ ความหมาย router.get(path url ที่จะใช้ ,       functionที่จะใช้); 
// ตัว express มันจะส่ง req res มาให้ เช่น ctrl.getAll
//มันก็จะส่ง getAll(req,res) ไป
router.get("/",       ctrl.getAll); //แก้ตามที่เขียนใน controller
router.get("/:id",    ctrl.getById); // แก้ตามที่เขียนใน controller
router.post("/",      ctrl.create); // แก้ตามที่เขียนใน controller 
router.put("/:id",    ctrl.update); // แก้ตามที่เขียนใน controller
router.delete("/:id", ctrl.remove); // แก้ตามที่เขียนใน controller

export default router;