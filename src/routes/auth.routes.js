import { Router } from "express";
import rateLimit from "express-rate-limit";

import * as auth from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from "../validators/auth.validators.js";

const router = Router();

// حماية إضافية ضد تجربة كلمات المرور
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "محاولات كتير أوي، جرّب تاني بعد 15 دقيقة." },
});

// حد أضيق لاستعادة كلمة المرور — عشان محدش يستخدمها في إزعاج الناس بإيميلات
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "طلبت إعادة تعيين كتير في وقت قصير، استنى ساعة وجرّب تاني.",
  },
});

router.post("/register", authLimiter, validate(registerSchema), auth.register);
router.post("/login", authLimiter, validate(loginSchema), auth.login);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);

router.post("/forgot-password", resetLimiter, validate(forgotPasswordSchema), auth.forgotPassword);
router.get("/reset-password/:token", auth.verifyResetToken);
router.post("/reset-password/:token", resetLimiter, validate(resetPasswordSchema), auth.resetPassword);

router.use(protect);
router.get("/me", auth.me);
router.patch("/me", validate(updateProfileSchema), auth.updateProfile);
router.patch("/password", validate(updatePasswordSchema), auth.updatePassword);
router.post("/logout-all", auth.logoutAll);

export default router;
