import { Router } from "express";
import rateLimit from "express-rate-limit";

import * as controller from "../controllers/quote.controller.js";
import { protect, optionalAuth, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { uploadAttachments, uploadErrorHandler } from "../middleware/upload.js";
import { createQuoteSchema, updateQuoteSchema } from "../validators/inbox.validators.js";

const router = Router();

// حد للطلبات عشان نمنع السبام
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "بعتّ طلبات كتير — استنى شوية وجرّب تاني." },
});

// إرسال طلب عرض سعر — متاح للزوار، وبنسجّل المستخدم لو داخل
router.post(
  "/",
  submitLimiter,
  optionalAuth,
  uploadAttachments.array("attachments", 5),
  uploadErrorHandler,
  validate(createQuoteSchema),
  controller.createQuote,
);

// العميل المسجّل
router.get("/my", protect, controller.myQuotes);

// الإدارة
router.get("/", protect, authorize("admin", "staff"), controller.listQuotes);
router.patch(
  "/:id",
  protect,
  authorize("admin", "staff"),
  validate(updateQuoteSchema),
  controller.updateQuote,
);
router.delete("/:id", protect, authorize("admin"), controller.deleteQuote);

// لازم يفضل آخر واحد
router.get("/:id", protect, controller.getQuote);

export default router;
