import { z } from "zod";

// القيم بتيجي من FormData فكلها نصوص — بنحوّلها لأنواعها الصح
const numberish = (schema) =>
  z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    return typeof v === "string" ? Number(v) : v;
  }, schema);

const booleanish = z.preprocess((v) => {
  if (typeof v === "string") return v === "true" || v === "1";
  return v;
}, z.boolean());

export const homeCardSchema = z.object({
  title: z
    .string({ required_error: "عنوان الكارت مطلوب" })
    .trim()
    .min(2, "العنوان قصير جدًا")
    .max(80, "العنوان طويل — خليه مختصر عشان يبان كويس على الصورة"),
  subtitle: z.string().trim().max(120, "السطر الصغير طويل جدًا").optional().or(z.literal("")),
  sortOrder: numberish(z.number().int().min(0).optional()),
  isActive: booleanish.optional(),
});

export const homeCardUpdateSchema = homeCardSchema.partial();

export const reorderSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1, "مفيش كروت للترتيب").max(60),
});
