import { Router } from "express";

import {
  createFolder,
  deleteFolder,
  renderDashboard,
} from "../controllers/folderController.js";
import { isAuthenticated } from "../controllers/authController.js";

const router = Router();

router.get("/new-folder", isAuthenticated, (req, res) => {
  res.render("partials/new-folder", {
    parentId: req.query.parentId || null,
  });
});

router.post("/new-folder", isAuthenticated, createFolder);

router.get("/folders/:id", isAuthenticated, renderDashboard);
router.post(
  "/folders/:id/delete",
  isAuthenticated,
  deleteFolder,
  (req, res) => {
    res.redirect("/");
  }
);

export default router;
