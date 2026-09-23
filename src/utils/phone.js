/**
 * تنضيف أرقام الواتساب.
 *
 * واتساب بيطلب الرقم بالصيغة الدولية من غير + ولا مسافات ولا أصفار بادئة.
 * المدير ممكن يكتبه بأي شكل — دي بتتكفّل بالباقي:
 *   05xxxxxxxx      → 9665xxxxxxxx
 *   +966 5x xxx xxx → 9665xxxxxxxx
 *   00966...        → 966...
 */

// بيحوّل الأرقام العربية/الفارسية لأرقام إنجليزية
const AR_DIGITS = /[٠-٩۰-۹]/g;

function toEnglishDigits(value) {
  return String(value ?? "").replace(AR_DIGITS, (d) => {
    const code = d.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

/** @param {string} raw @param {string} defaultCountry كود الدولة من غير + */
export function normalizeWhatsAppNumber(raw, defaultCountry = "966") {
  let digits = toEnglishDigits(raw).replace(/\D/g, "");
  if (!digits) return "";

  // 00966... → 966...
  if (digits.startsWith("00")) digits = digits.slice(2);

  // 05xxxxxxxx (سعودي محلي) → 9665xxxxxxxx
  if (digits.startsWith("0")) digits = defaultCountry + digits.slice(1);

  // 5xxxxxxxx من غير صفر ولا كود دولة
  if (digits.length === 9 && digits.startsWith("5")) digits = defaultCountry + digits;

  return digits;
}

export default normalizeWhatsAppNumber;
