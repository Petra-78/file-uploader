import { Router } from "express";
import path from "node:path";
const router = Router();
import { signUp, isAuthenticated } from "../controllers/authController.js";
import { signupValidator } from "../validators/authValidator.js";
import {
  postFile,
  renderNewFileForm,
  fileDetails,
  deleteFile,
} from "../controllers/fileController.js";
import multer from "multer";
import { renderDashboard } from "../controllers/folderController.js";
const upload = multer({
  dest: path.join(process.cwd(), "public/uploads"),
});

router.get("/", renderDashboard);

router.post("/sign-up", signupValidator, signUp);

router.get("/folders/:folderId/new-file", isAuthenticated, renderNewFileForm);
router.post(
  "/folders/:folderId/new-file",
  isAuthenticated,
  upload.single("file"),
  postFile
);

router.get("/folders/:folderId/:fileId", isAuthenticated, fileDetails);
router.post("/folders/:folderId/:fileId/delete", isAuthenticated, deleteFile);

export default router;
