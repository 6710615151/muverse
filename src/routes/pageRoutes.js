import { Router } from "express";
import { join } from "path";
import { PAGES_DIR } from "../config/paths.js";

const router = Router();

const servePage = (page) => (req, res) => {
  res.sendFile(join(PAGES_DIR, page));
};

router.get("/",            servePage("index.html"));
router.get("/Auth",    servePage("auth.html"));
router.get("/test",     servePage("testAPI.html"));
router.get("/customer",    servePage("customer/index.html"));
router.get("/seller",    servePage("seller/index.html"));
export default router;
