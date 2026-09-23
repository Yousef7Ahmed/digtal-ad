// slug يشتغل مع العربي والإنجليزي
export function slugify(value) {
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      // شيل التشكيل والتطويل
      .replace(/[ً-ْـ]/g, "")
      // وحّد شكل الألف والياء والتاء المربوطة
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      // أي حاجة مش حرف ولا رقم تبقى شرطة
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90) || "item"
  );
}

/**
 * بيرجّع slug مش مكرر في الكولكشن.
 * excludeId: عشان التعديل ما يتصادمش مع نفسه.
 */
export async function uniqueSlug(Model, value, excludeId = null) {
  const base = slugify(value);
  let slug = base;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.exists(query);
    if (!exists) return slug;
    slug = `${base}-${counter++}`;
  }
}
