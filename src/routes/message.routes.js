import { Router } from "express";
import rateLimit from "express-rate-limit";

import * as controller from "../controllers/message.controller.js";
import { protect, optionalAuth, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { createMessageSchema, updateMessageSchema } from "../validators/inbox.validators.js";

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "بعتّ رسائل كتير — استنى شوية وجرّب تاني." },
});

// إرسال رسالة — متاح للزوار
router.post("/", submitLimiter, optionalAuth, validate(createMessageSchema), controller.createMessage);

// الإدارة
router.use(protect, authorize("admin", "staff"));
router.get("/", controller.listMessages);
router.patch("/:id", validate(updateMessageSchema), controller.updateMessage);
router.delete("/:id", authorize("admin"), controller.deleteMessage);

export default router;
