import { getSiteSettings } from "../models/Setting.js";
import asyncHandler from "../utils/asyncHandler.js";
import { normalizeWhatsAppNumber } from "../utils/phone.js";

/** المسارات العامة اللي الموقع بيقراها (من غير أي بيانات إدارية) */
function publicView(settings) {
  return {
    company: settings.company,
    social: settings.social,
    stats: settings.stats,
    testimonials: settings.testimonials,
    whatsapp: settings.whatsapp,
    seo: settings.seo,
  };
}

// GET /api/settings — عام (الموقع بيقرا منه بيانات الشركة والأرقام والآراء)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();
  res.json({ success: true, data: publicView(settings) });
});

// PATCH /api/settings — الإدارة
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();
  const { company, social, stats, testimonials, whatsapp, seo } = req.body;

  const plain = (value) => (typeof value?.toObject === "function" ? value.toObject() : { ...(value || {}) });

  if (company) settings.company = { ...plain(settings.company), ...company };
  if (social) settings.social = { ...plain(settings.social), ...social };
  if (stats) settings.stats = stats;
  if (testimonials) settings.testimonials = testimonials;

  if (whatsapp) {
    const merged = { ...plain(settings.whatsapp), ...whatsapp };
    // بنخزّن الرقم بالصيغة الدولية عشان الواجهة ما تفكرش فيه
    if (whatsapp.number !== undefined) merged.number = normalizeWhatsAppNumber(whatsapp.number);
    settings.whatsapp = merged;
  }

  if (seo) {
    const merged = { ...plain(settings.seo), ...seo };
    // شيل السلاش الأخير من الدومين عشان الروابط ما تبقاش فيها //
    if (merged.siteUrl) merged.siteUrl = String(merged.siteUrl).trim().replace(/\/+$/, "");
    if (merged.twitterHandle) merged.twitterHandle = String(merged.twitterHandle).replace(/^@/, "");
    settings.seo = merged;
  }

  await settings.save();

  res.json({ success: true, message: "تم حفظ الإعدادات", data: { settings } });
});
