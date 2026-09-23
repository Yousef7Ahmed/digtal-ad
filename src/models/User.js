import crypto from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export const ROLES = ["customer", "staff", "admin"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "الاسم مطلوب"],
      trim: true,
      minlength: [3, "الاسم قصير جدًا"],
      maxlength: [80, "الاسم طويل جدًا"],
    },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "البريد الإلكتروني غير صالح"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^0?5\d{8}$/, "رقم الجوال غير صالح (لازم يبدأ بـ 05)"],
    },
    company: { type: String, trim: true, maxlength: 120 },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      minlength: [8, "كلمة المرور لازم تكون 8 حروف على الأقل"],
      select: false,
    },
    role: { type: String, enum: ROLES, default: "customer" },
    isActive: { type: Boolean, default: true },
    // بنزوّده عشان نلغي كل جلسات المستخدم (تغيير كلمة مرور / خروج من كل الأجهزة)
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: Date,

    // استعادة كلمة المرور — بنخزّن هاش التوكن مش التوكن نفسه
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.tokenVersion;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.index({ role: 1, createdAt: -1 });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.isAdminSide = function isAdminSide() {
  return this.role === "admin" || this.role === "staff";
};

/**
 * بيعمل توكن استعادة كلمة مرور.
 * بيرجّع التوكن الخام (اللي بيروح في الإيميل) وبيخزّن الهاش بس في القاعدة،
 * فحتى لو حد بصّ في الداتابيز مش هيقدر يستخدمه.
 */
userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.passwordResetExpires = new Date(Date.now() + env.passwordResetMinutes * 60 * 1000);

  return rawToken;
};

/** هاش التوكن الخام — بنستخدمه للبحث وقت إعادة التعيين */
userSchema.statics.hashResetToken = function hashResetToken(rawToken) {
  return crypto.createHash("sha256").update(String(rawToken)).digest("hex");
};

export default mongoose.model("User", userSchema);
