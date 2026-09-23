import mongoose from "mongoose";
import Quote, { QUOTE_STATUSES, QUOTE_STATUS_LABELS } from "../models/Quote.js";
import { nextSequence } from "../models/Counter.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteImages, uploadImages } from "../services/storage.js";
import { env } from "../config/env.js";
import { adminRecipient, sendTemplate } from "../services/email.js";
import {
  quoteReceivedAdminEmail,
  quoteReceivedEmail,
  quoteUpdatedEmail,
} from "../services/emailTemplates.js";

const isAdminSide = (user) => user?.role === "admin" || user?.role === "staff";

// POST /api/quotes — من نموذج "اطلب خدمة" (مفتوح للزوار)
export const createQuote = asyncHandler(async (req, res) => {
  const { service, serviceTitle, budget, timeline, details, goals, contact } = req.body;

  const attachments = req.files?.length
    ? (await uploadImages(req.files, "quotes")).map((file, index) => ({
        ...file,
        name: req.files[index].originalname,
        size: req.files[index].size,
      }))
    : [];

  const sequence = await nextSequence("quote");

  const quote = await Quote.create({
    quoteNumber: `QT-${sequence}`,
    service,
    serviceTitle,
    budget,
    timeline,
    details,
    goals,
    attachments,
    contact,
    user: req.user?._id || null,
    status: "new",
    statusHistory: [{ status: "new", at: new Date(), by: req.user?._id }],
  });

  sendTemplate(
    quote.contact?.email,
    quoteReceivedEmail({ quote, clientUrl: env.clientUrl }),
    { replyTo: adminRecipient() || undefined },
  );
  sendTemplate(
    adminRecipient(),
    quoteReceivedAdminEmail({ quote, clientUrl: env.clientUrl }),
    { replyTo: quote.contact?.email },
  );

  res.status(201).json({
    success: true,
    message: "تم استلام طلبك",
    data: { quote: { _id: quote._id, quoteNumber: quote.quoteNumber, createdAt: quote.createdAt } },
  });
});

// GET /api/quotes/my — عروض الأسعار بتاعة العميل المسجّل
export const myQuotes = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, results: quotes.length, data: { quotes } });
});

// GET /api/quotes/:id
export const getQuote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { quoteNumber: id.toUpperCase() };

  const quote = await Quote.findOne(query).populate("user", "name email phone");
  if (!quote) throw ApiError.notFound("الطلب مش موجود");

  const ownerId = String(quote.user?._id || quote.user || "");
  if (!isAdminSide(req.user) && ownerId !== String(req.user._id)) {
    throw ApiError.forbidden("الطلب ده مش بتاعك");
  }

  res.json({ success: true, data: { quote } });
});

// ===================== الإدارة =====================

// GET /api/quotes
export const listQuotes = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 15);

  const filter = {};
  if (status && QUOTE_STATUSES.includes(status)) filter.status = status;
  if (search) {
    const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { quoteNumber: rx },
      { "contact.name": rx },
      { "contact.phone": rx },
      { "contact.company": rx },
    ];
  }

  const [quotes, total, counts] = await Promise.all([
    Quote.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Quote.countDocuments(filter),
    Quote.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    results: quotes.length,
    pagination: { page, pages: Math.ceil(total / limit), total, limit },
    counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
    data: { quotes },
  });
});

// PATCH /api/quotes/:id — تحديث الحالة أو كتابة العرض
export const updateQuote = asyncHandler(async (req, res) => {
  const { status, quotedAmount, quotedNote, adminNotes, note } = req.body;

  const quote = await Quote.findById(req.params.id);
  if (!quote) throw ApiError.notFound("الطلب مش موجود");

  const statusChanged = Boolean(status && status !== quote.status);

  if (statusChanged) {
    if (!QUOTE_STATUSES.includes(status)) throw ApiError.badRequest("حالة غير معروفة");
    quote.status = status;
    quote.statusHistory.push({ status, at: new Date(), by: req.user._id, note });
  }

  if (quotedAmount !== undefined) {
    quote.quotedAmount = quotedAmount;
    quote.quotedAt = quotedAmount === null ? null : new Date();
  }
  if (quotedNote !== undefined) quote.quotedNote = quotedNote;
  if (adminNotes !== undefined) quote.adminNotes = adminNotes;

  await quote.save();

  // العميل بيتبلّغ لما العرض يتبعتله أو الحالة توصل لقرار نهائي —
  // مش مع كل حفظ للملاحظات الداخلية
  const NOTIFY_ON = ["quoted", "accepted", "rejected", "closed"];

  if (statusChanged && NOTIFY_ON.includes(quote.status)) {
    sendTemplate(
      quote.contact?.email,
      quoteUpdatedEmail({
        quote,
        statusLabel: QUOTE_STATUS_LABELS[quote.status] || quote.status,
        clientUrl: env.clientUrl,
      }),
      { replyTo: adminRecipient() || undefined },
    );
  }

  res.json({
    success: true,
    message: status ? `تم تحديث الحالة إلى "${QUOTE_STATUS_LABELS[status]}"` : "تم الحفظ",
    data: { quote },
  });
});

// DELETE /api/quotes/:id
export const deleteQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) throw ApiError.notFound("الطلب مش موجود");

  await deleteImages(quote.attachments.map((a) => a.publicId));
  await quote.deleteOne();

  res.json({ success: true, message: "تم حذف الطلب" });
});
