import { Router } from "express";

import * as controller from "../controllers/homeCard.controller.js";
import { adminOnly, optionalAuth, protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { uploadImages, uploadErrorHandler } from "../middleware/upload.js";
import {
  homeCardSchema,
  homeCardUpdateSchema,
  reorderSchema,
} from "../validators/homeCard.validators.js";

const singleImage = [uploadImages.single("image"), uploadErrorHandler];

const router = Router();

router.get("/", optionalAuth, controller.listHomeCards);

// الترتيب لازم ييجي قبل /:id عشان ما يتفسّرش كـ id
router.patch("/reorder", ...adminOnly, validate(reorderSchema), controller.reorderHomeCards);

router.post("/", ...adminOnly, ...singleImage, validate(homeCardSchema), controller.createHomeCard);
router.patch(
  "/:id",
  ...adminOnly,
  ...singleImage,
  validate(homeCardUpdateSchema),
  controller.updateHomeCard,
);
router.delete("/:id", protect, authorize("admin"), controller.deleteHomeCard);

export default router;
