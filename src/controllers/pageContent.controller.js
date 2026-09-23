import PageContent from "../models/PageContent.js";
import { PAGE_SCHEMA, fieldsFor, seoDefaults } from "../config/pageSchema.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteImage, uploadImage } from "../services/storage.js";

/** بيحوّل مستند الصفحة لكائن بسيط { texts: {}, images: {} } */
function toPlain(doc) {
  return {
    texts: doc ? { ...(doc.texts || {}) } : {},
    images: doc
      ? Object.fromEntries(
          Object.entries(doc.images || {}).map(([key, value]) => [key, { url: value?.url }]),
        )
      : {},
  };
}

// GET /api/page-content — كل الصفحات (بيستخدمها الموقع)
export const getAllContent = asyncHandler(async (req, res) => {
  const docs = await PageContent.find();
  const pages = {};

  for (const doc of docs) pages[doc._id] = toPlain(doc);

  // بيانات SEO جاهزة لكل صفحة (تعديل المدير لو موجود، وإلا الافتراضي)
  // — الواجهة بتاخدها زي ما هي من غير ما تحتفظ بنسخة من النصوص الافتراضية
  const seo = {};
  for (const [pageKey, defaults] of Object.entries(seoDefaults())) {
    const overrides = pages[pageKey]?.texts || {};
    seo[pageKey] = {
      title: overrides["seo.title"] || defaults.title,
      description: overrides["seo.description"] || defaults.description,
    };
  }

  res.json({ success: true, data: { pages, seo } });
});

// GET /api/page-content/schema — المخطّط + القيم الحالية (بيستخدمها المحرر)
export const getSchema = asyncHandler(async (req, res) => {
  const docs = await PageContent.find();
  const values = {};

  for (const doc of docs) values[doc._id] = toPlain(doc);

  res.json({ success: true, data: { schema: PAGE_SCHEMA, values } });
});

// PATCH /api/page-content/:page — حفظ تعديلات صفحة
export const updateContent = asyncHandler(async (req, res) => {
  const { page } = req.params;

  const fields = fieldsFor(page);
  if (!fields.length) throw ApiError.notFound("الصفحة دي مش موجودة في المخطّط");

  const textKeys = new Set(fields.filter((f) => f.type !== "image").map((f) => f.key));
  const imageKeys = new Set(fields.filter((f) => f.type === "image").map((f) => f.key));

  const doc = (await PageContent.findById(page)) || new PageContent({ _id: page, texts: {}, images: {} });
  // احتياطًا لو مستند قديم اتسجّل من غير الحقلين دول
  if (!doc.texts) doc.texts = {};
  if (!doc.images) doc.images = {};

  // النصوص بتيجي كـ JSON في حقل texts (عشان الفورم بيتبعت FormData مع الصور)
  let texts = req.body.texts;
  if (typeof texts === "string") {
    try {
      texts = JSON.parse(texts);
    } catch {
      throw ApiError.badRequest("صيغة النصوص غير صالحة");
    }
  }

  if (texts && typeof texts === "object") {
    for (const [key, value] of Object.entries(texts)) {
      if (!textKeys.has(key)) continue;

      const clean = String(value ?? "").slice(0, 3000);
      // القيمة الفاضية معناها "رجّع الافتراضي"
      if (clean.trim() === "") delete doc.texts[key];
      else doc.texts[key] = clean;
    }
  }

  // الصور المرفوعة: اسم الحقل في الفورم هو مفتاح الصورة
  for (const file of req.files || []) {
    if (!imageKeys.has(file.fieldname)) continue;

    const old = doc.images[file.fieldname];
    const uploaded = await uploadImage(file, `pages/${page}`);
    doc.images[file.fieldname] = uploaded;
    await deleteImage(old?.publicId);
  }

  // إعادة صور للافتراضي
  let resetImages = req.body.resetImages;
  if (typeof resetImages === "string") {
    try {
      resetImages = JSON.parse(resetImages);
    } catch {
      resetImages = [];
    }
  }

  for (const key of resetImages || []) {
    if (!imageKeys.has(key)) continue;
    const old = doc.images[key];
    delete doc.images[key];
    await deleteImage(old?.publicId);
  }

  // Mixed مش Map — لازم نعلّمها "اتعدّلت" يدويًا عشان Mongoose يحفظ التغيير
  doc.markModified("texts");
  doc.markModified("images");

  doc.updatedBy = req.user._id;
  await doc.save();

  res.json({ success: true, message: "اتحفظ المحتوى", data: { page: toPlain(doc) } });
});

// DELETE /api/page-content/:page — رجّع الصفحة كلها للنص الافتراضي
export const resetContent = asyncHandler(async (req, res) => {
  const doc = await PageContent.findById(req.params.page);
  if (!doc) return res.json({ success: true, message: "الصفحة على الافتراضي أصلاً" });

  for (const value of Object.values(doc.images || {})) await deleteImage(value?.publicId);
  await doc.deleteOne();

  res.json({ success: true, message: "رجّعنا الصفحة للنص الافتراضي" });
});
