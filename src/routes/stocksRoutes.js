import { Router } from "express";
import * as ctrl from "../controllers/stocksController.js";

const router = Router();

// Market
router.get("/",                          ctrl.getAll);
router.get("/:id",                       ctrl.getById);
router.get("/category/:category_id",     ctrl.getByCategory);

// Digital Item Admin
router.get("/seller/:seller_id",         ctrl.getAllBySeller);
router.post("/",                         ctrl.create);
router.put("/:id",                       ctrl.update);
router.delete("/:id",                    ctrl.remove);

export default router;
