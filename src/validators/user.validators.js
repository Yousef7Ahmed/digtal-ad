import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^0?5\d{8}$/, "رقم الجوال غير صالح (لازم يبدأ بـ 05)")
  .optional()
  .or(z.literal(""));

const password = z
  .string({ required_error: "كلمة المرور مطلوبة" })
  .min(8, "كلمة المرور لازم تكون 8 حروف على الأقل")
  .max(72);

export const createUserSchema = z.object({
  name: z.string({ required_error: "الاسم مطلوب" }).trim().min(3, "الاسم قصير جدًا").max(80),
  email: z
    .string({ required_error: "البريد الإلكتروني مطلوب" })
    .trim()
    .toLowerCase()
    .email("البريد الإلكتروني غير صالح"),
  password,
  phone,
  // الحسابات اللي بتتعمل من الداشبورد إدارية بس
  role: z.enum(["staff", "admin"], { required_error: "لازم تحدد الدور" }),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(3, "الاسم قصير جدًا").max(80).optional(),
  phone,
  company: z.string().trim().max(120).optional().or(z.literal("")),
  role: z.enum(["customer", "staff", "admin"]).optional(),
  isActive: z.boolean().optional(),
});

export const setPasswordSchema = z.object({
  newPassword: password,
});
