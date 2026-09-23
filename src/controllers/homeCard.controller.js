import HomeCard from "../models/HomeCard.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteImage, uploadImage } from "../services/storage.js";

const isAdminSide = (user) => user?.role === "admin" || user?.role === "staff";

// GET /api/home-cards — الموقع بياخد المفعّل بس، والداشبورد بياخد الكل بـ ?all=true
export const listHomeCards = asyncHandler(async (req, res) => {
  const filter = isAdminSide(req.user) && req.query.all === "true" ? {} : { isActive: true };

  const cards = await HomeCard.find(filter).sort({ sortOrder: 1, createdAt: 1 });

  res.json({ success: true, results: cards.length, data: { cards } });
});

// POST /api/home-cards
export const createHomeCard = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("صورة الكارت مطلوبة");

  const image = await uploadImage(req.file, "home-cards");

  // لو الإدارة ما حددتش ترتيب، بنحطه في الآخر
  const sortOrder =
    req.body.sortOrder !== undefined && req.body.sortOrder !== null
      ? req.body.sortOrder
      : await HomeCard.countDocuments();

  const card = await HomeCard.create({ ...req.body, sortOrder, image });

  res.status(201).json({ success: true, message: "تم إضافة الكارت", data: { card } });
});

// PATCH /api/home-cards/:id
export const updateHomeCard = asyncHandler(async (req, res) => {
  const card = await HomeCard.findById(req.params.id);
  if (!card) throw ApiError.notFound("الكارت مش موجود");

  // الصورة الجديدة بتحل محل القديمة، والقديمة بتتمسح من التخزين
  if (req.file) {
    const oldPublicId = card.image?.publicId;
    card.image = await uploadImage(req.file, "home-cards");
    await deleteImage(oldPublicId);
  }

  Object.assign(card, req.body);
  await card.save();

  res.json({ success: true, message: "تم تحديث الكارت", data: { card } });
});

// DELETE /api/home-cards/:id
export const deleteHomeCard = asyncHandler(async (req, res) => {
  const card = await HomeCard.findById(req.params.id);
  if (!card) throw ApiError.notFound("الكارت مش موجود");

  await deleteImage(card.image?.publicId);
  await card.deleteOne();

  res.json({ success: true, message: "تم حذف الكارت" });
});

// PATCH /api/home-cards/reorder — ترتيب جديد للكروت كلها مرة واحدة
export const reorderHomeCards = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  await HomeCard.bulkWrite(
    ids.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { sortOrder: index } } },
    })),
  );

  const cards = await HomeCard.find().sort({ sortOrder: 1, createdAt: 1 });

  res.json({ success: true, message: "تم حفظ الترتيب", data: { cards } });
});
