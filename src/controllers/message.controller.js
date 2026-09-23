import Message, { MESSAGE_STATUSES, MESSAGE_STATUS_LABELS } from "../models/Message.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import { adminRecipient, sendTemplate } from "../services/email.js";
import { messageReceivedAdminEmail, messageReplyEmail } from "../services/emailTemplates.js";

// POST /api/messages — من نموذج "تواصل معنا" (مفتوح للزوار)
export const createMessage = asyncHandler(async (req, res) => {
  const message = await Message.create({ ...req.body, user: req.user?._id || null });

  // الإدارة بتتبلّغ فورًا — ده كان أكتر حاجة بتضيع من غير إشعار
  sendTemplate(
    adminRecipient(),
    messageReceivedAdminEmail({ message, clientUrl: env.clientUrl }),
    { replyTo: message.email || undefined },
  );

  res.status(201).json({
    success: true,
    message: "وصلتنا رسالتك",
    data: { message: { _id: message._id, createdAt: message.createdAt } },
  });
});

// GET /api/messages — الإدارة
export const listMessages = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 15);

  const filter = {};
  if (status && MESSAGE_STATUSES.includes(status)) filter.status = status;
  if (search) {
    const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { subject: rx }];
  }

  const [messages, total, counts] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Message.countDocuments(filter),
    Message.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    results: messages.length,
    pagination: { page, pages: Math.ceil(total / limit), total, limit },
    counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
    data: { messages },
  });
});

// PATCH /api/messages/:id — تعليم مقروءة أو تسجيل الرد
export const updateMessage = asyncHandler(async (req, res) => {
  const { status, reply } = req.body;

  const message = await Message.findById(req.params.id);
  if (!message) throw ApiError.notFound("الرسالة مش موجودة");

  if (reply) {
    message.reply = { text: reply, by: req.user._id, at: new Date() };
    message.status = "replied";
  }
  if (status && !reply) {
    if (!MESSAGE_STATUSES.includes(status)) throw ApiError.badRequest("حالة غير معروفة");
    message.status = status;
  }

  await message.save();

  // الرد بيتبعت للعميل على الإيميل لو كان سايبه
  if (reply && message.email) {
    sendTemplate(
      message.email,
      messageReplyEmail({ message, replyText: reply, clientUrl: env.clientUrl }),
      { replyTo: adminRecipient() || undefined },
    );
  }

  res.json({
    success: true,
    message: reply && message.email
      ? "تم حفظ الرد وإرساله على إيميل العميل"
      : `تم التحديث إلى "${MESSAGE_STATUS_LABELS[message.status]}"`,
    data: { message },
  });
});

// DELETE /api/messages/:id
export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) throw ApiError.notFound("الرسالة مش موجودة");

  res.json({ success: true, message: "تم حذف الرسالة" });
});
