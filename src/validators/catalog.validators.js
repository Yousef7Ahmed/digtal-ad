import { z } from "zod";

// الفورم بيبعت FormData، فالأرقام والبولين بيوصلوا كنصوص
const numberish = (schema) =>
  z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    return typeof v === "string" ? Number(v) : v;
  }, schema);

const booleanish = z.preprocess((v) => {
  if (typeof v === "string") return v === "true" || v === "1";
  return v;
}, z.boolean());

// الحقول اللي الفاضي فيها معناه "مفيش" (null) مش "ما تغيّرش"
const nullableNumber = (schema) =>
  z.preprocess((v) => {
    if (v === "" || v === null || v === "null") return null;
    if (v === undefined) return undefined;
    return typeof v === "string" ? Number(v) : v;
  }, schema.nullable().optional());

const jsonArray = (itemSchema) =>
  z.preprocess((v) => {
    if (typeof v !== "string") return v;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }, z.array(itemSchema));

const objectId = z
  .string({ required_error: "التصنيف مطلوب" })
  .regex(/^[0-9a-fA-F]{24}$/, "التصنيف غير صالح");

// ===================== التصنيفات =====================
export const categorySchema = z.object({
  name: z.string({ required_error: "اسم التصنيف مطلوب" }).trim().min(2, "الاسم قصير جدًا").max(80),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  icon: z.string().trim().max(8).optional().or(z.literal("")),
  sortOrder: numberish(z.number().int().min(0).optional()),
  isActive: booleanish.optional(),
});

export const categoryUpdateSchema = categorySchema.partial();

// ===================== المنتجات =====================
const choiceSchema = z.object({
  label: z.string().trim().min(1, "اسم الاختيار مطلوب").max(60),
  priceDelta: numberish(z.number().min(0, "فرق السعر ما يصحّش يكون بالسالب").default(0)),
  isDefault: z.boolean().optional(),
});

const optionSchema = z.object({
  name: z.string().trim().min(1, "اسم الخيار مطلوب").max(60),
  required: z.boolean().optional(),
  choices: z.array(choiceSchema).min(1, "لازم اختيار واحد على الأقل في كل خيار"),
});

export const productSchema = z.object({
  name: z.string({ required_error: "اسم المنتج مطلوب" }).trim().min(2, "الاسم قصير جدًا").max(120),
  category: objectId,
  basePrice: numberish(
    z.number({ required_error: "السعر مطلوب" }).min(0, "السعر ما يصحّش يكون بالسالب"),
  ),
  compareAtPrice: nullableNumber(z.number().min(0)),
  priceFrom: booleanish.optional(),
  shortDescription: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  sku: z.string().trim().max(40).optional().or(z.literal("")),
  minQuantity: numberish(z.number().int().min(1).optional()),
  stock: nullableNumber(z.number().int().min(0)),
  isFeatured: booleanish.optional(),
  isPublished: booleanish.optional(),
  sortOrder: numberish(z.number().int().min(0).optional()),
  options: jsonArray(optionSchema).optional(),
  // الصور القديمة اللي المستخدم عايز يفضّلها عند التعديل (publicId لكل واحدة)
  keepImages: jsonArray(z.string()).optional(),
});

export const productUpdateSchema = productSchema.partial();

export const listQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  category: z.string().trim().optional(), // id أو slug
  featured: z.string().optional(),
  status: z.enum(["all", "published", "draft"]).optional(),
  minPrice: numberish(z.number().min(0).optional()),
  maxPrice: numberish(z.number().min(0).optional()),
  sort: z.enum(["newest", "oldest", "price-asc", "price-desc", "name"]).optional(),
  page: numberish(z.number().int().min(1).optional()),
  limit: numberish(z.number().int().min(1).max(60).optional()),
});
