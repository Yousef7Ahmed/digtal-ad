import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import { sendMail, sendTemplate } from "../services/email.js";
import {
  passwordChangedEmail,
  passwordResetEmail,
  welcomeEmail,
} from "../services/emailTemplates.js";
import {
  REFRESH_COOKIE,
  clearRefreshCookie,
  issueTokens,
  verifyRefreshToken,
} from "../utils/token.js";

// POST /api/auth/register — تسجيل عميل جديد (الأدوار الإدارية بتتعمل من الداشبورد)
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, company } = req.body;

  if (await User.exists({ email })) {
    throw ApiError.conflict("فيه حساب مسجّل بالبريد ده بالفعل");
  }

  const user = await User.create({ name, email, password, phone, company, role: "customer" });
  const accessToken = issueTokens(res, user);

  sendTemplate(user.email, welcomeEmail({ user, clientUrl: env.clientUrl }));

  res.status(201).json({
    success: true,
    message: "تم إنشاء الحساب بنجاح",
    data: { user, accessToken },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  // نفس الرسالة في الحالتين عشان محدش يعرف الإيميل مسجّل ولا لأ
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }
  if (!user.isActive) throw ApiError.forbidden("الحساب موقوف، كلّم الإدارة");

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = issueTokens(res, user);

  res.json({
    success: true,
    message: "تم تسجيل الدخول",
    data: { user, accessToken },
  });
});

// POST /api/auth/refresh — بيجدد الـ access token من كوكي الـ refresh
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized("الجلسة منتهية، سجّل دخول تاني");

  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) throw ApiError.unauthorized("الجلسة غير صالحة");
  // لو الرقم اتغيّر يبقى كل التوكنات القديمة اتلغت
  if (user.tokenVersion !== payload.ver) {
    clearRefreshCookie(res);
    throw ApiError.unauthorized("الجلسة اتلغت، سجّل دخول تاني");
  }

  const accessToken = issueTokens(res, user);
  res.json({ success: true, data: { user, accessToken } });
});

// POST /api/auth/logout — خروج من الجهاز الحالي
export const logout = asyncHandler(async (req, res) => {
  clearRefreshCookie(res);
  res.json({ success: true, message: "تم تسجيل الخروج" });
});

// POST /api/auth/logout-all — خروج من كل الأجهزة
export const logoutAll = asyncHandler(async (req, res) => {
  req.user.tokenVersion += 1;
  await req.user.save({ validateBeforeSave: false });
  clearRefreshCookie(res);
  res.json({ success: true, message: "تم تسجيل الخروج من كل الأجهزة" });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

// PATCH /api/auth/me
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, company } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (company !== undefined) req.user.company = company;

  await req.user.save();
  res.json({ success: true, message: "تم تحديث البيانات", data: { user: req.user } });
});

// PATCH /api/auth/password — تغيير كلمة المرور وإلغاء باقي الجلسات
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest("كلمة المرور الحالية غير صحيحة");
  }

  user.password = newPassword;
  user.tokenVersion += 1;
  await user.save();

  sendTemplate(user.email, passwordChangedEmail({ user, clientUrl: env.clientUrl }));

  const accessToken = issueTokens(res, user);
  res.json({ success: true, message: "تم تغيير كلمة المرور", data: { accessToken } });
});

// ===================== استعادة كلمة المرور =====================

// POST /api/auth/forgot-password — بيبعت رابط إعادة التعيين على الإيميل
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // الرد واحد في كل الحالات عشان محدش يستخدم الصفحة دي عشان يعرف
  // الإيميلات المسجّلة عندنا إيه
  const genericResponse = {
    success: true,
    message: "لو البريد ده مسجّل عندنا، هيوصلك رابط إعادة التعيين خلال دقايق. راجع صندوق الوارد و Spam.",
  };

  const user = await User.findOne({ email });

  if (!user || !user.isActive) return res.json(genericResponse);

  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password/${rawToken}`;

  // هنا بننتظر النتيجة عشان لو الإرسال فشل ما نسيبش توكن معلّق في القاعدة
  const result = await sendMail({
    to: user.email,
    ...passwordResetEmail({ user, resetUrl, minutes: env.passwordResetMinutes }),
  });

  if (!result.sent && result.reason !== "not-configured") {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw ApiError.internal("حصلت مشكلة في إرسال الإيميل، جرّب تاني بعد شوية");
  }

  // في التطوير (من غير SMTP) بنطبع الرابط في الكونسول عشان تقدر تجرّب
  if (result.reason === "not-configured") {
    console.log(`🔑 رابط إعادة تعيين كلمة المرور لـ ${user.email}:\n   ${resetUrl}`);
  }

  res.json(genericResponse);
});

// GET /api/auth/reset-password/:token — بتتأكد إن الرابط لسه صالح قبل ما نعرض الفورم
export const verifyResetToken = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    passwordResetToken: User.hashResetToken(req.params.token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) throw ApiError.badRequest("الرابط غير صالح أو انتهت صلاحيته");

  res.json({ success: true, data: { email: user.email, name: user.name } });
});

// POST /api/auth/reset-password/:token — تعيين كلمة مرور جديدة
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findOne({
    passwordResetToken: User.hashResetToken(req.params.token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user) {
    throw ApiError.badRequest("الرابط غير صالح أو انتهت صلاحيته — اطلب رابط جديد");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // بيلغي كل الجلسات القديمة
  user.tokenVersion += 1;
  await user.save();

  sendTemplate(user.email, passwordChangedEmail({ user, clientUrl: env.clientUrl }));

  const accessToken = issueTokens(res, user);

  res.json({
    success: true,
    message: "تم تعيين كلمة المرور الجديدة",
    data: { user, accessToken },
  });
});
