import { Router } from "express";
import { join } from "path";
import { PAGES_DIR } from "../config/paths.js";

const router = Router();

const servePage = (page) => (req, res) => {
  res.sendFile(join(PAGES_DIR, page));
};

router.get("/",            servePage("index.html"));
router.get("/SignInSignUp",    servePage("auth.html"));
router.get("/Signup",     servePage("/singin.html"));

export default router;
