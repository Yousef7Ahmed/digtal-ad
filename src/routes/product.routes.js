import { Router } from "express";

import * as controller from "../controllers/product.controller.js";
import { adminOnly, optionalAuth, protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { uploadImages, uploadErrorHandler } from "../middleware/upload.js";
import {
  listQuerySchema,
  productSchema,
  productUpdateSchema,
} from "../validators/catalog.validators.js";

const router = Router();
const manyImages = [uploadImages.array("images", 8), uploadErrorHandler];

// عام
router.get("/", optionalAuth, validate(listQuerySchema, "query"), controller.listProducts);
router.get("/:idOrSlug", optionalAuth, controller.getProduct);

// إدارة
router.post("/", ...adminOnly, ...manyImages, validate(productSchema), controller.createProduct);
router.patch(
  "/:id",
  ...adminOnly,
  ...manyImages,
  validate(productUpdateSchema),
  controller.updateProduct,
);
router.patch("/:id/toggle", ...adminOnly, controller.toggleProductFlag);
router.post("/bulk-delete", protect, authorize("admin"), controller.bulkDeleteProducts);
router.delete("/:id", protect, authorize("admin"), controller.deleteProduct);

export default router;
