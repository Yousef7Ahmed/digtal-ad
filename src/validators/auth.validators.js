import { z } from "zod";

const email = z
  .string({ required_error: "البريد الإلكتروني مطلوب" })
  .trim()
  .toLowerCase()
  .email("البريد الإلكتروني غير صالح");

const password = z
  .string({ required_error: "كلمة المرور مطلوبة" })
  .min(8, "كلمة المرور لازم تكون 8 حروف على الأقل")
  .max(72, "كلمة المرور طويلة جدًا");

const phone = z
  .string()
  .trim()
  .regex(/^0?5\d{8}$/, "رقم الجوال غير صالح (لازم يبدأ بـ 05)")
  .optional()
  .or(z.literal(""));

export const registerSchema = z.object({
  name: z.string({ required_error: "الاسم مطلوب" }).trim().min(3, "الاسم قصير جدًا").max(80),
  email,
  password,
  phone,
  company: z.string().trim().max(120).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email,
  password: z.string({ required_error: "كلمة المرور مطلوبة" }).min(1, "كلمة المرور مطلوبة"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string({ required_error: "كلمة المرور الحالية مطلوبة" }).min(1),
  newPassword: password,
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  password,
  // اختياري — لو الواجهة بعتته بنتأكد إنه مطابق
  confirmPassword: z.string().optional(),
}).refine(
  (data) => !data.confirmPassword || data.confirmPassword === data.password,
  { message: "كلمتا المرور غير متطابقتين", path: ["confirmPassword"] },
);

export const updateProfileSchema = z.object({
  name: z.string().trim().min(3, "الاسم قصير جدًا").max(80).optional(),
  phone,
  company: z.string().trim().max(120).optional().or(z.literal("")),
});
