import { Router } from "express";

import * as controller from "../controllers/user.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  createUserSchema,
  setPasswordSchema,
  updateUserSchema,
} from "../validators/user.validators.js";

const router = Router();

// كل المسارات دي للإدارة
router.use(protect, authorize("admin", "staff"));

router.get("/", controller.listUsers);
router.get("/:id", controller.getUser);

// التعديل على الحسابات للمدير بس
router.post("/", authorize("admin"), validate(createUserSchema), controller.createUser);
router.patch("/:id", authorize("admin"), validate(updateUserSchema), controller.updateUser);
router.patch(
  "/:id/password",
  authorize("admin"),
  validate(setPasswordSchema),
  controller.setUserPassword,
);
router.delete("/:id", authorize("admin"), controller.deleteUser);

export default router;
