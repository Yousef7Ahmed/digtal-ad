import { z } from "zod";

const phone = z
  .string({ required_error: "رقم الجوال مطلوب" })
  .trim()
  .regex(/^0?5\d{8}$/, "رقم الجوال غير صالح (لازم يبدأ بـ 05)");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("البريد الإلكتروني غير صالح")
  .optional()
  .or(z.literal(""));

// الفورم بيتبعت FormData عشان المرفقات — فالكائنات بتتبعت كنص JSON
const jsonObject = (schema) =>
  z.preprocess((v) => {
    if (typeof v !== "string") return v;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }, schema);

const numberish = (schema) =>
  z.preprocess((v) => {
    if (v === "" || v === null || v === "null") return null;
    if (v === undefined) return undefined;
    return typeof v === "string" ? Number(v) : v;
  }, schema);

export const createQuoteSchema = z.object({
  service: z.string({ required_error: "لازم تختار الخدمة" }).trim().min(1, "لازم تختار الخدمة").max(80),
  serviceTitle: z.string().trim().max(120).optional().or(z.literal("")),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  timeline: z.string().trim().max(60).optional().or(z.literal("")),
  details: z
    .string({ required_error: "وصف المشروع مطلوب" })
    .trim()
    .min(10, "اكتب تفاصيل أكتر عن المشروع")
    .max(4000),
  goals: z.string().trim().max(2000).optional().or(z.literal("")),
  contact: jsonObject(
    z.object({
      name: z.string({ required_error: "الاسم مطلوب" }).trim().min(3, "الاسم قصير جدًا").max(80),
      phone,
      email,
      company: z.string().trim().max(120).optional().or(z.literal("")),
    }),
  ),
});

export const updateQuoteSchema = z.object({
  status: z.string().optional(),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  quotedAmount: numberish(z.number().min(0, "المبلغ ما يصحّش يكون بالسالب").nullable()).optional(),
  quotedNote: z.string().trim().max(2000).optional().or(z.literal("")),
  adminNotes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const createMessageSchema = z.object({
  name: z.string({ required_error: "الاسم مطلوب" }).trim().min(3, "الاسم قصير جدًا").max(80),
  phone,
  email,
  subject: z.string({ required_error: "الموضوع مطلوب" }).trim().min(3, "الموضوع قصير جدًا").max(140),
  message: z
    .string({ required_error: "الرسالة مطلوبة" })
    .trim()
    .min(10, "اكتب رسالة أطول شوية")
    .max(3000),
});

export const updateMessageSchema = z.object({
  status: z.string().optional(),
  reply: z.string().trim().max(3000).optional().or(z.literal("")),
});
