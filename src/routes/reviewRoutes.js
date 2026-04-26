import { Router } from "express";
import * as ctrl from "../controllers/reviewController.js";

const router = Router();

router.post("/",                      ctrl.create);
router.get("/seller/:seller_id",      ctrl.getBySeller);

export default router;
