import { Router } from "express";
import path from "node:path";
const router = Router();
import { signUp, isAuthenticated } from "../controllers/authController.js";
import { signupValidator } from "../validators/authValidator.js";
import { postNewFile } from "../controllers/indexController.js";
import multer from "multer";
import { renderFolders } from "../controllers/folderController.js";
const upload = multer({
  dest: path.join(process.cwd(), "public/uploads"),
});

router.get("/", renderFolders, (req, res) => {
  res.render("index");
});

router.post("/sign-up", signupValidator, signUp);
router.get("/new-file", (req, res) => {
  res.render("new-file");
});
router.post("/new-file", isAuthenticated, upload.single("file"), postNewFile);

export default router;
