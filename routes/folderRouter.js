import { Router } from "express";
import multer from "multer";

import { createFolder, deleteFolder } from "../controllers/folderController.js";
import { isAuthenticated } from "../controllers/authController.js";

const router = Router();

router.get("/new-folder", isAuthenticated, (req, res) => {
  res.render("new-folder");
});
router.post("/new-folder", isAuthenticated, createFolder);

router.post("/folders/:id/delete", isAuthenticated, deleteFolder);

export default router;
