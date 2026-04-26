import { Router } from "express";
import * as ctrl from "../controllers/sellerController.js";

const router = Router();

router.get("/",                ctrl.getAllSellers);
router.get("/user/:id",        ctrl.getSellerByUserId);
router.patch("/:id/verify",    ctrl.verifySeller);
router.get("/:id",             ctrl.getSellerById);

export default router;
