import { Router } from "express";

import * as controller from "../controllers/pageContent.controller.js";
import { adminOnly } from "../middleware/auth.js";
import { uploadImages, uploadErrorHandler } from "../middleware/upload.js";

const router = Router();

// عام — الموقع بيقرا منه نصوص وصور الصفحات
router.get("/", controller.getAllContent);

// الإدارة
router.get("/schema", ...adminOnly, controller.getSchema);
router.patch(
  "/:page",
  ...adminOnly,
  uploadImages.any(),
  uploadErrorHandler,
  controller.updateContent,
);
router.delete("/:page", ...adminOnly, controller.resetContent);

export default router;
