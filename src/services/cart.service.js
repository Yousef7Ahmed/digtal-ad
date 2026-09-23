import Cart from "../models/Cart.js";
import ApiError from "../utils/ApiError.js";
import { calculateTotals } from "../config/pricing.js";

/**
 * بيتحقق إن الاختيارات اللي جاية من العميل موجودة فعلاً في خيارات المنتج،
 * وبيرجّع الاختيارات بفرق السعر الصح من قاعدة البيانات (مش من المتصفح).
 */
export function normalizeSelections(product, incoming = []) {
  const chosen = new Map(incoming.map((s) => [s.name, s.choice]));
  const result = [];

  for (const option of product.options || []) {
    const label = chosen.get(option.name);

    if (!label) {
      if (option.required !== false) {
        throw ApiError.badRequest(`لازم تختار "${option.name}" قبل الإضافة للسلة`);
      }
      continue;
    }

    const choice = option.choices.find((c) => c.label === label);
    if (!choice) {
      throw ApiError.badRequest(`الاختيار "${label}" مش متاح في "${option.name}"`);
    }

    result.push({ name: option.name, choice: choice.label, priceDelta: choice.priceDelta || 0 });
  }

  return result;
}

/** سعر الوحدة = السعر الأساسي + فروق الاختيارات */
export function unitPriceFor(product, selections = []) {
  const extra = selections.reduce((sum, s) => sum + (s.priceDelta || 0), 0);
  return Math.round((product.basePrice + extra) * 100) / 100;
}

/** مقارنة اختيارات عنصرين — عشان نعرف نجمع نفس المنتج بنفس الاختيارات */
export function sameSelections(a = [], b = []) {
  if (a.length !== b.length) return false;
  const key = (list) =>
    [...list]
      .map((s) => `${s.name}::${s.choice}`)
      .sort()
      .join("|");
  return key(a) === key(b);
}

/** بيجيب سلة المستخدم أو يعملها لو مش موجودة */
export async function getOrCreateCart(userId) {
  const cart = await Cart.findOne({ user: userId });
  return cart || Cart.create({ user: userId, items: [] });
}

/**
 * بيحوّل السلة لشكل جاهز للعرض:
 * بيحسب الأسعار من المنتج الحالي، وبيشيل أي منتج اتمسح أو اتوقف نشره.
 */
export async function buildCartView(cart) {
  await cart.populate({
    path: "items.product",
    select: "name slug basePrice compareAtPrice images options isPublished stock minQuantity",
  });

  const removed = [];
  const items = [];

  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isPublished) {
      removed.push(String(item._id));
      continue;
    }

    const unitPrice = unitPriceFor(product, item.selections);

    items.push({
      _id: item._id,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.url || null,
        minQuantity: product.minQuantity,
        stock: product.stock,
      },
      selections: item.selections,
      quantity: item.quantity,
      unitPrice,
      lineTotal: Math.round(unitPrice * item.quantity * 100) / 100,
    });
  }

  // لو فيه منتجات اتشالت من المتجر، نشيلها من السلة كمان
  if (removed.length) {
    cart.items = cart.items.filter((item) => !removed.includes(String(item._id)));
    await cart.save();
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    _id: cart._id,
    items,
    itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totals: calculateTotals(subtotal),
    removedCount: removed.length,
  };
}
