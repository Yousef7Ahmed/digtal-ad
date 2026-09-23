import { z } from "zod";

const phone = z
  .string({ required_error: "رقم الجوال مطلوب" })
  .trim()
  .regex(/^0?5\d{8}$/, "رقم الجوال غير صالح (لازم يبدأ بـ 05)");

export const addItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "المنتج غير صالح"),
  quantity: z.number().int().min(1).max(10000).optional(),
  selections: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        choice: z.string().trim().min(1),
      }),
    )
    .optional(),
});

export const updateItemSchema = z.object({
  quantity: z.number({ required_error: "الكمية مطلوبة" }).int().min(1).max(10000),
});

export const createOrderSchema = z.object({
  contact: z.object({
    name: z.string({ required_error: "الاسم مطلوب" }).trim().min(3, "الاسم قصير جدًا").max(80),
    phone,
    email: z.string().trim().toLowerCase().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
    company: z.string().trim().max(120).optional().or(z.literal("")),
  }),
  address: z
    .object({
      city: z.string().trim().max(60).optional().or(z.literal("")),
      district: z.string().trim().max(60).optional().or(z.literal("")),
      street: z.string().trim().max(120).optional().or(z.literal("")),
      details: z.string().trim().max(300).optional().or(z.literal("")),
    })
    .optional(),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const updateStatusSchema = z.object({
  status: z.string({ required_error: "الحالة مطلوبة" }),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  adminNotes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(300).optional().or(z.literal("")),
});
