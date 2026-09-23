/**
 * إعدادات حساب الطلب.
 *
 * دلوقتي: مفيش ضريبة ومفيش شحن ومفيش دفع أونلاين.
 * لما تجهز، غيّر enabled لـ true هنا وبس — الحساب كله بيمشي من الدالة اللي تحت،
 * والواجهة بتقرأ نفس القيم من /api/settings/pricing فما فيش حاجة تانية تتغير.
 */
export const PRICING = {
  currency: "SAR",

  vat: {
    enabled: false, // خليها true لما تفعّل ضريبة القيمة المضافة
    rate: 0.15,
    inclusive: false, // true يعني الأسعار المعروضة شاملة الضريبة
  },

  shipping: {
    enabled: false, // خليها true لما تحدد رسوم الشحن
    flatRate: 0,
    freeAbove: null, // مثال: 500 يعني الشحن مجاني فوق 500 ر.س
  },

  payment: {
    enabled: false, // هيتفعّل لما توصل بوابة الدفع من البنك
    methods: [], // مثال لاحقًا: ["mada", "card", "applepay"]
  },
};

const round = (value) => Math.round((Number(value) || 0) * 100) / 100;

/** بياخد مجموع المنتجات ويرجّع تفاصيل الحساب النهائي */
export function calculateTotals(subtotal) {
  const base = round(subtotal);

  let vat = 0;
  if (PRICING.vat.enabled) {
    vat = PRICING.vat.inclusive
      ? round(base - base / (1 + PRICING.vat.rate)) // ضريبة داخلة في السعر
      : round(base * PRICING.vat.rate);
  }

  let shipping = 0;
  if (PRICING.shipping.enabled) {
    const { flatRate, freeAbove } = PRICING.shipping;
    shipping = freeAbove !== null && base >= freeAbove ? 0 : round(flatRate);
  }

  const total = PRICING.vat.inclusive ? round(base + shipping) : round(base + vat + shipping);

  return {
    subtotal: base,
    vat,
    vatIncluded: PRICING.vat.enabled && PRICING.vat.inclusive,
    shipping,
    discount: 0,
    total,
    currency: PRICING.currency,
  };
}
