import { z } from "zod";

const numberish = (schema) =>
  z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    return typeof v === "string" ? Number(v) : v;
  }, schema);

const booleanish = z.preprocess((v) => {
  if (typeof v === "string") return v === "true" || v === "1";
  return v;
}, z.boolean());

// الميزات بتيجي كنص JSON أو سطور
const features = z.preprocess((v) => {
  if (Array.isArray(v)) return v;
  if (typeof v !== "string") return v;
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* مش JSON — يبقى سطور */
  }
  return v.split("\n").map((line) => line.trim()).filter(Boolean);
}, z.array(z.string().trim().min(1).max(120)).max(12));

export const serviceSchema = z.object({
  title: z.string({ required_error: "اسم الخدمة مطلوب" }).trim().min(3, "الاسم قصير جدًا").max(120),
  icon: z.string().trim().max(8).optional().or(z.literal("")),
  color: z.string().trim().max(20).optional().or(z.literal("")),
  shortDesc: z.string().trim().max(300).optional().or(z.literal("")),
  desc: z.string().trim().max(3000).optional().or(z.literal("")),
  price: z.string().trim().max(80).optional().or(z.literal("")),
  features: features.optional(),
  sortOrder: numberish(z.number().int().min(0).optional()),
  isActive: booleanish.optional(),
});

export const serviceUpdateSchema = serviceSchema.partial();

export const workSchema = z.object({
  title: z.string({ required_error: "عنوان العمل مطلوب" }).trim().min(3, "العنوان قصير جدًا").max(140),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  service: z.string().trim().max(120).optional().or(z.literal("")),
  client: z.string().trim().max(120).optional().or(z.literal("")),
  result: z.string().trim().max(140).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  sortOrder: numberish(z.number().int().min(0).optional()),
  isPublished: booleanish.optional(),
});

export const workUpdateSchema = workSchema.partial();
