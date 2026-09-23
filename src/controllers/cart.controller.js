import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  buildCartView,
  getOrCreateCart,
  normalizeSelections,
  sameSelections,
} from "../services/cart.service.js";

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json({ success: true, data: { cart: await buildCartView(cart) } });
});

// POST /api/cart/items
export const addItem = asyncHandler(async (req, res) => {
  const { productId, selections = [], quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isPublished) throw ApiError.notFound("المنتج مش متاح");

  const normalized = normalizeSelections(product, selections);

  const min = product.minQuantity || 1;
  let qty = Math.max(min, Number(quantity) || min);
  if (product.stock !== null && qty > product.stock) {
    throw ApiError.badRequest(`المتاح من المنتج ده ${product.stock} بس`);
  }

  const cart = await getOrCreateCart(req.user._id);

  // نفس المنتج بنفس الاختيارات؟ نزوّد الكمية بدل ما نضيف سطر جديد
  const existing = cart.items.find(
    (item) => String(item.product) === String(product._id) && sameSelections(item.selections, normalized),
  );

  if (existing) {
    const newQty = existing.quantity + qty;
    if (product.stock !== null && newQty > product.stock) {
      throw ApiError.badRequest(`المتاح من المنتج ده ${product.stock} بس`);
    }
    existing.quantity = newQty;
  } else {
    cart.items.push({ product: product._id, selections: normalized, quantity: qty });
  }

  await cart.save();
  res.status(201).json({
    success: true,
    message: "تمت الإضافة للسلة",
    data: { cart: await buildCartView(cart) },
  });
});

// PATCH /api/cart/items/:itemId
export const updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw ApiError.notFound("العنصر مش موجود في السلة");

  const product = await Product.findById(item.product);
  if (!product) throw ApiError.notFound("المنتج مش متاح");

  const min = product.minQuantity || 1;
  const qty = Math.max(min, Number(quantity) || min);
  if (product.stock !== null && qty > product.stock) {
    throw ApiError.badRequest(`المتاح من المنتج ده ${product.stock} بس`);
  }

  item.quantity = qty;
  await cart.save();

  res.json({ success: true, data: { cart: await buildCartView(cart) } });
});

// DELETE /api/cart/items/:itemId
export const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw ApiError.notFound("العنصر مش موجود في السلة");

  item.deleteOne();
  await cart.save();

  res.json({ success: true, message: "اتشال من السلة", data: { cart: await buildCartView(cart) } });
});

// DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();

  res.json({ success: true, message: "اتفضّت السلة", data: { cart: await buildCartView(cart) } });
});
