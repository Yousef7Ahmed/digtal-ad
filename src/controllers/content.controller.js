import mongoose from "mongoose";
import Service from "../models/Service.js";
import Work from "../models/Work.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uniqueSlug } from "../utils/slugify.js";
import { deleteImage, uploadImage } from "../services/storage.js";

const isAdminSide = (user) => user?.role === "admin" || user?.role === "staff";

const parseFeatures = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    // كل سطر ميزة
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
};

// ===================== الخدمات =====================

// GET /api/services
export const listServices = asyncHandler(async (req, res) => {
  const filter = isAdminSide(req.user) && req.query.all === "true" ? {} : { isActive: true };
  const services = await Service.find(filter).sort({ sortOrder: 1, createdAt: 1 });

  res.json({ success: true, results: services.length, data: { services } });
});

// GET /api/services/:idOrSlug
export const getService = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };

  const service = await Service.findOne(query);
  if (!service) throw ApiError.notFound("الخدمة مش موجودة");

  res.json({ success: true, data: { service } });
});

// POST /api/services
export const createService = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (await Service.exists({ title })) throw ApiError.conflict("فيه خدمة بنفس الاسم");

  const image = req.file ? await uploadImage(req.file, "services") : undefined;
  const features = parseFeatures(req.body.features);

  const service = await Service.create({
    ...req.body,
    ...(features ? { features } : {}),
    slug: await uniqueSlug(Service, title),
    image,
  });

  res.status(201).json({ success: true, message: "تم إضافة الخدمة", data: { service } });
});

// PATCH /api/services/:id
export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw ApiError.notFound("الخدمة مش موجودة");

  if (req.body.title && req.body.title !== service.title) {
    if (await Service.exists({ title: req.body.title, _id: { $ne: service._id } })) {
      throw ApiError.conflict("فيه خدمة بنفس الاسم");
    }
    service.slug = await uniqueSlug(Service, req.body.title, service._id);
  }

  if (req.file) {
    const oldPublicId = service.image?.publicId;
    service.image = await uploadImage(req.file, "services");
    await deleteImage(oldPublicId);
  }

  const features = parseFeatures(req.body.features);
  const { features: _ignored, ...rest } = req.body;

  Object.assign(service, rest);
  if (features) service.features = features;
  await service.save();

  res.json({ success: true, message: "تم تحديث الخدمة", data: { service } });
});

// DELETE /api/services/:id
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw ApiError.notFound("الخدمة مش موجودة");

  const worksCount = await Work.countDocuments({ service: service.slug });
  if (worksCount > 0) {
    throw ApiError.badRequest(
      `فيه ${worksCount} عمل مرتبط بالخدمة دي — غيّر خدمتهم الأول أو اخفِ الخدمة بدل ما تمسحها`,
    );
  }

  await deleteImage(service.image?.publicId);
  await service.deleteOne();

  res.json({ success: true, message: "تم حذف الخدمة" });
});

// ===================== معرض الأعمال =====================

// GET /api/works
export const listWorks = asyncHandler(async (req, res) => {
  const filter = isAdminSide(req.user) && req.query.all === "true" ? {} : { isPublished: true };
  if (req.query.service) filter.service = req.query.service;

  const works = await Work.find(filter).sort({ sortOrder: 1, createdAt: -1 });

  res.json({ success: true, results: works.length, data: { works } });
});

// POST /api/works
export const createWork = asyncHandler(async (req, res) => {
  const image = req.file ? await uploadImage(req.file, "portfolio") : undefined;

  const work = await Work.create({
    ...req.body,
    slug: await uniqueSlug(Work, req.body.title),
    image,
  });

  res.status(201).json({ success: true, message: "تم إضافة العمل", data: { work } });
});

// PATCH /api/works/:id
export const updateWork = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) throw ApiError.notFound("العمل مش موجود");

  if (req.body.title && req.body.title !== work.title) {
    work.slug = await uniqueSlug(Work, req.body.title, work._id);
  }

  if (req.file) {
    const oldPublicId = work.image?.publicId;
    work.image = await uploadImage(req.file, "portfolio");
    await deleteImage(oldPublicId);
  }

  Object.assign(work, req.body);
  await work.save();

  res.json({ success: true, message: "تم تحديث العمل", data: { work } });
});

// DELETE /api/works/:id
export const deleteWork = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) throw ApiError.notFound("العمل مش موجود");

  await deleteImage(work.image?.publicId);
  await work.deleteOne();

  res.json({ success: true, message: "تم حذف العمل" });
});
