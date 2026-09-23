import { Router } from "express";

import * as controller from "../controllers/content.controller.js";
import { adminOnly, optionalAuth, protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { uploadImages, uploadErrorHandler } from "../middleware/upload.js";
import {
  serviceSchema,
  serviceUpdateSchema,
  workSchema,
  workUpdateSchema,
} from "../validators/content.validators.js";

const singleImage = [uploadImages.single("image"), uploadErrorHandler];

// ===================== الخدمات =====================
export const serviceRouter = Router();

serviceRouter.get("/", optionalAuth, controller.listServices);
serviceRouter.get("/:idOrSlug", controller.getService);

serviceRouter.post("/", ...adminOnly, ...singleImage, validate(serviceSchema), controller.createService);
serviceRouter.patch(
  "/:id",
  ...adminOnly,
  ...singleImage,
  validate(serviceUpdateSchema),
  controller.updateService,
);
serviceRouter.delete("/:id", protect, authorize("admin"), controller.deleteService);

// ===================== معرض الأعمال =====================
export const workRouter = Router();

workRouter.get("/", optionalAuth, controller.listWorks);

workRouter.post("/", ...adminOnly, ...singleImage, validate(workSchema), controller.createWork);
workRouter.patch("/:id", ...adminOnly, ...singleImage, validate(workUpdateSchema), controller.updateWork);
workRouter.delete("/:id", protect, authorize("admin"), controller.deleteWork);
