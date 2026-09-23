import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uniqueSlug } from "../utils/slugify.js";
import { deleteImage, uploadImage } from "../services/storage.js";

// GET /api/categories  — عام (بيرجّع المفعّل بس) وللإدارة الكل
export const listCategories = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "admin" || req.user?.role === "staff";
  const filter = isAdmin && req.query.all === "true" ? {} : { isActive: true };

  const categories = await Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .populate("productsCount");

  res.json({ success: true, results: categories.length, data: { categories } });
});

// GET /api/categories/:idOrSlug
export const getCategory = asyncHandler(async (req, res) => {
  const category = await findByIdOrSlug(req.params.idOrSlug);
  res.json({ success: true, data: { category } });
});

// POST /api/categories
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (await Category.exists({ name })) {
    throw ApiError.conflict("فيه تصنيف بنفس الاسم بالفعل");
  }

  const image = req.file ? await uploadImage(req.file, "categories") : undefined;

  const category = await Category.create({
    ...req.body,
    slug: await uniqueSlug(Category, name),
    image,
  });

  res.status(201).json({ success: true, message: "تم إضافة التصنيف", data: { category } });
});

// PATCH /api/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound("التصنيف مش موجود");

  if (req.body.name && req.body.name !== category.name) {
    if (await Category.exists({ name: req.body.name, _id: { $ne: category._id } })) {
      throw ApiError.conflict("فيه تصنيف بنفس الاسم بالفعل");
    }
    category.slug = await uniqueSlug(Category, req.body.name, category._id);
  }

  if (req.file) {
    const oldPublicId = category.image?.publicId;
    category.image = await uploadImage(req.file, "categories");
    await deleteImage(oldPublicId);
  }

  Object.assign(category, req.body);
  await category.save();

  res.json({ success: true, message: "تم تحديث التصنيف", data: { category } });
});

// DELETE /api/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound("التصنيف مش موجود");

  const productsCount = await Product.countDocuments({ category: category._id });
  if (productsCount > 0) {
    throw ApiError.badRequest(
      `مش هينفع تمسح التصنيف ده وفيه ${productsCount} منتج — انقل المنتجات لتصنيف تاني الأول`,
    );
  }

  await deleteImage(category.image?.publicId);
  await category.deleteOne();

  res.json({ success: true, message: "تم حذف التصنيف" });
});

async function findByIdOrSlug(idOrSlug) {
  const query = /^[0-9a-fA-F]{24}$/.test(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
  const category = await Category.findOne(query).populate("productsCount");
  if (!category) throw ApiError.notFound("التصنيف مش موجود");
  return category;
}
