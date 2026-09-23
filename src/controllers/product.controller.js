import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { clearSitemapCache } from "../routes/seo.routes.js";
import { uniqueSlug } from "../utils/slugify.js";
import { deleteImages, uploadImages } from "../services/storage.js";

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "price-asc": { basePrice: 1 },
  "price-desc": { basePrice: -1 },
  name: { name: 1 },
};

// GET /api/products
export const listProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    featured,
    status = "published",
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    limit = 12,
  } = req.query;

  const isAdmin = req.user?.role === "admin" || req.user?.role === "staff";
  const filter = {};

  // الزوار بيشوفوا المنشور بس
  if (!isAdmin || status === "published") filter.isPublished = true;
  else if (status === "draft") filter.isPublished = false;

  if (category) {
    const categoryDoc = await resolveCategory(category);
    if (!categoryDoc) {
      return res.json({
        success: true,
        results: 0,
        pagination: { page: 1, pages: 0, total: 0, limit },
        data: { products: [] },
      });
    }
    filter.category = categoryDoc._id;
  }

  if (featured === "true") filter.isFeatured = true;
  if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.basePrice = {};
    if (minPrice !== undefined) filter.basePrice.$gte = minPrice;
    if (maxPrice !== undefined) filter.basePrice.$lte = maxPrice;
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug icon")
      .sort(SORTS[sort] || SORTS.newest)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    results: products.length,
    pagination: { page, pages: Math.ceil(total / limit), total, limit },
    data: { products },
  });
});

// GET /api/products/:idOrSlug
export const getProduct = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };

  const product = await Product.findOne(query).populate("category", "name slug icon");
  if (!product) throw ApiError.notFound("المنتج مش موجود");

  const isAdmin = req.user?.role === "admin" || req.user?.role === "staff";
  if (!product.isPublished && !isAdmin) throw ApiError.notFound("المنتج مش موجود");

  // منتجات مشابهة من نفس التصنيف
  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isPublished: true,
  })
    .limit(4)
    .select("name slug basePrice priceFrom images");

  res.json({ success: true, data: { product, related } });
});

// POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  clearSitemapCache();
  await ensureCategoryExists(req.body.category);

  const images = req.files?.length ? await uploadImages(req.files, "products") : [];

  const product = await Product.create({
    ...req.body,
    slug: await uniqueSlug(Product, req.body.name),
    images,
  });

  await product.populate("category", "name slug icon");
  res.status(201).json({ success: true, message: "تم إضافة المنتج", data: { product } });
});

// PATCH /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  clearSitemapCache();
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound("المنتج مش موجود");

  if (req.body.category) await ensureCategoryExists(req.body.category);

  if (req.body.name && req.body.name !== product.name) {
    product.slug = await uniqueSlug(Product, req.body.name, product._id);
  }

  // الصور: نسيب اللي المستخدم اختار يفضّلها، نمسح الباقي، ونضيف الجديد
  const { keepImages, ...fields } = req.body;
  if (keepImages) {
    const keep = new Set(keepImages);
    const removed = product.images.filter((img) => !keep.has(img.publicId));
    product.images = product.images.filter((img) => keep.has(img.publicId));
    await deleteImages(removed.map((img) => img.publicId));
  }
  if (req.files?.length) {
    const uploaded = await uploadImages(req.files, "products");
    product.images.push(...uploaded);
  }

  Object.assign(product, fields);
  await product.save();
  await product.populate("category", "name slug icon");

  res.json({ success: true, message: "تم تحديث المنتج", data: { product } });
});

// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  clearSitemapCache();
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound("المنتج مش موجود");

  await deleteImages(product.images.map((img) => img.publicId));
  await product.deleteOne();

  res.json({ success: true, message: "تم حذف المنتج" });
});

// PATCH /api/products/:id/toggle — نشر / تمييز بضغطة واحدة من الجدول
export const toggleProductFlag = asyncHandler(async (req, res) => {
  clearSitemapCache();
  const { field } = req.body;
  if (!["isPublished", "isFeatured"].includes(field)) {
    throw ApiError.badRequest("الحقل ده مش قابل للتبديل");
  }

  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound("المنتج مش موجود");

  product[field] = !product[field];
  await product.save();

  res.json({ success: true, data: { product } });
});

// POST /api/products/bulk-delete
export const bulkDeleteProducts = asyncHandler(async (req, res) => {
  clearSitemapCache();
  const ids = (req.body.ids || []).filter((id) => mongoose.isValidObjectId(id));
  if (!ids.length) throw ApiError.badRequest("مفيش منتجات محددة");

  const products = await Product.find({ _id: { $in: ids } });
  await deleteImages(products.flatMap((p) => p.images.map((img) => img.publicId)));
  await Product.deleteMany({ _id: { $in: ids } });

  res.json({ success: true, message: `تم حذف ${products.length} منتج` });
});

// ===================== مساعدات =====================
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function resolveCategory(value) {
  const query = mongoose.isValidObjectId(value) ? { _id: value } : { slug: value };
  return Category.findOne(query).select("_id");
}

async function ensureCategoryExists(id) {
  if (!(await Category.exists({ _id: id }))) throw ApiError.badRequest("التصنيف المختار مش موجود");
}
