import { Router } from "express";
import * as ctrl from "../controllers/sellerController.js";

const router = Router();

router.get("/",       ctrl.getAllUserSeller);
router.get("/:id",    ctrl.getSellerByUserId);


export default router;
