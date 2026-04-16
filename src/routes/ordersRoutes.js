import { Router } from "express";
import * as ctrl from "../controllers/ordersController.js";

const router = Router();

// Buy Digital Item
router.post("/buy",                      ctrl.buyItem);

// Buyer
router.get("/customer/:customer_id",     ctrl.getByCustomer);

// Manage Order (Seller)
router.get("/seller/:seller_id",         ctrl.getBySeller);
router.get("/:id",                       ctrl.getById);
router.patch("/:id/status",             ctrl.updateStatus);
router.patch("/:id/payment",            ctrl.updatePayment);

export default router;
