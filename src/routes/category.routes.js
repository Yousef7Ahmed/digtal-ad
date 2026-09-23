import { Router } from "express";

import * as controller from "../controllers/category.controller.js";
import { adminOnly, optionalAuth, protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { uploadImages, uploadErrorHandler } from "../middleware/upload.js";
import { categorySchema, categoryUpdateSchema } from "../validators/catalog.validators.js";

const router = Router();
const singleImage = [uploadImages.single("image"), uploadErrorHandler];

// عام
router.get("/", optionalAuth, controller.listCategories);
router.get("/:idOrSlug", controller.getCategory);

// إدارة
router.post("/", ...adminOnly, ...singleImage, validate(categorySchema), controller.createCategory);
router.patch(
  "/:id",
  ...adminOnly,
  ...singleImage,
  validate(categoryUpdateSchema),
  controller.updateCategory,
);
router.delete("/:id", protect, authorize("admin"), controller.deleteCategory);

export default router;
