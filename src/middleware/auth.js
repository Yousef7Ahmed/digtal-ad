import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/token.js";

// بيتأكد إن فيه توكن صالح وبيحط المستخدم في req.user
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) throw ApiError.unauthorized("لازم تسجّل دخول الأول");

  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub);

  if (!user) throw ApiError.unauthorized("الحساب مش موجود");
  if (!user.isActive) throw ApiError.forbidden("الحساب موقوف، كلّم الإدارة");

  req.user = user;
  next();
});

// زيّ protect بس ما بيرفضش لو مفيش توكن — بنستخدمه في المسارات العامة
// عشان الإدارة تشوف المسودات والزوار لأ
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user?.isActive) req.user = user;
  } catch {
    // توكن باظ؟ نكمّل كأننا زائر عادي
  }
  next();
});

// بيسمح لأدوار معيّنة بس
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("ليس لديك صلاحية لهذا الإجراء"));
    }
    next();
  };
}

// اختصار لمسارات لوحة التحكم
export const adminOnly = [protect, authorize("admin", "staff")];
export const superAdminOnly = [protect, authorize("admin")];
