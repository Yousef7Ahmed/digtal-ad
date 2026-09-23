import { z } from "zod";

const text = (max) => z.string().trim().max(max).optional().or(z.literal(""));

export const updateSettingsSchema = z.object({
  company: z
    .object({
      name: text(80),
      nameAr: text(120),
      phone: text(20),
      email: z.string().trim().toLowerCase().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
      website: text(120),
      address: text(200),
      founded: text(20),
      about: text(2000),
      vision: text(1000),
      mission: text(1000),
      workingHours: text(120),
    })
    .optional(),

  social: z
    .object({
      facebook: text(200),
      instagram: text(200),
      twitter: text(200),
      linkedin: text(200),
      tiktok: text(200),
      snapchat: text(200),
      youtube: text(200),
      whatsapp: text(200),
    })
    .optional(),

  whatsapp: z
    .object({
      enabled: z.boolean().optional(),
      number: text(25),
      message: text(300),
      tooltip: text(60),
      position: z.enum(["right", "left"]).optional(),
    })
    .optional(),

  seo: z
    .object({
      siteName: text(80),
      defaultTitle: text(70),
      titleTemplate: text(60),
      defaultDescription: text(300),
      keywords: text(300),
      siteUrl: text(200),
      ogImage: text(500),
      twitterHandle: text(40),
      gaId: z
        .string()
        .trim()
        .max(40)
        .regex(/^(G-[A-Z0-9]+|UA-\d+-\d+)$/i, "معرّف Google Analytics لازم يبدأ بـ G- أو UA-")
        .optional()
        .or(z.literal("")),
      searchConsole: text(120),
      indexable: z.boolean().optional(),
    })
    .optional(),

  stats: z
    .array(
      z.object({
        num: z.string().trim().min(1, "الرقم مطلوب").max(20),
        label: z.string().trim().min(1, "الوصف مطلوب").max(60),
      }),
    )
    .max(8)
    .optional(),

  testimonials: z
    .array(
      z.object({
        name: z.string().trim().min(2, "الاسم قصير جدًا").max(80),
        role: text(120),
        text: z.string().trim().min(10, "الرأي قصير جدًا").max(600),
        avatar: text(4),
      }),
    )
    .max(12)
    .optional(),
});
