import { Router } from "express";
import * as ctrl from "../controllers/customerController.js";

const router = Router();

router.get("/",       ctrl.getAllUserCustomers);
router.get("/:id",    ctrl.getCustomerByUserId);


export default router;
