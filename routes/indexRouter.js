import { Router } from "express";
const router = Router();
import { signUp, isAuthenticated } from "../controllers/authController.js";
import { signupValidator } from "../validators/authValidator.js";

router.get("/", (req, res) => {
  res.render("index");
});

router.post("/sign-up", signupValidator, signUp);
router.get("/new-file", (req, res) => {
  res.render("new-file");
});

export default router;
