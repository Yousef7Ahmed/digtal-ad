import mongoose from "mongoose";
import Order, { ORDER_STATUSES, STATUS_LABELS } from "../models/Order.js";
import User from "../models/User.js";
import Quote from "../models/Quote.js";
import Message from "../models/Message.js";
import { nextSequence } from "../models/Counter.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildCartView, getOrCreateCart } from "../services/cart.service.js";
import { calculateTotals } from "../config/pricing.js";
import { env } from "../config/env.js";
import { adminRecipient, sendTemplate } from "../services/email.js";
import { orderPlacedAdminEmail, orderPlacedEmail, orderStatusEmail } from "../services/emailTemplates.js";

const isAdminSide = (user) => user?.role === "admin" || user?.role === "staff";

// POST /api/orders — إنشاء الطلب من السلة
export const createOrder = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const view = await buildCartView(cart);

  if (view.items.length === 0) throw ApiError.badRequest("السلة فاضية");

  const { contact, address, notes } = req.body;

  // النسخة الثابتة من المنتجات وقت الطلب
  const items = view.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    slug: item.product.slug,
    image: item.product.image,
    selections: item.selections,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totals = calculateTotals(subtotal);
  const sequence = await nextSequence("order");

  const order = await Order.create({
    orderNumber: `DA-${sequence}`,
    user: req.user._id,
    items,
    ...totals,
    status: "pending_review",
    statusHistory: [{ status: "pending_review", at: new Date(), by: req.user._id }],
    contact: {
      name: contact.name,
      phone: contact.phone,
      email: contact.email || req.user.email,
      company: contact.company,
    },
    address,
    notes,
  });

  // نفضّي السلة بعد ما الطلب اتسجّل
  cart.items = [];
  await cart.save();

  // إشعارات الإيميل — في الخلفية، عمرها ما توقّف الطلب
  sendTemplate(
    order.contact.email,
    orderPlacedEmail({ order, clientUrl: env.clientUrl }),
    { replyTo: adminRecipient() || undefined },
  );
  sendTemplate(
    adminRecipient(),
    orderPlacedAdminEmail({ order, clientUrl: env.clientUrl }),
    { replyTo: order.contact.email },
  );

  res.status(201).json({
    success: true,
    message: "تم استلام طلبك",
    data: { order },
  });
});

// GET /api/orders/my
export const myOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(30, Number(req.query.limit) || 10);

  const filter = { user: req.user._id };

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    results: orders.length,
    pagination: { page, pages: Math.ceil(total / limit), total, limit },
    data: { orders },
  });
});

// GET /api/orders/:id — صاحب الطلب أو الإدارة
export const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = mongoose.isValidObjectId(id) ? { _id: id } : { orderNumber: id.toUpperCase() };
  const order = await Order.findOne(query).populate("user", "name email phone company");

  if (!order) throw ApiError.notFound("الطلب مش موجود");
  if (!isAdminSide(req.user) && String(order.user?._id || order.user) !== String(req.user._id)) {
    throw ApiError.forbidden("الطلب ده مش بتاعك");
  }

  res.json({ success: true, data: { order } });
});

// PATCH /api/orders/:id/cancel — العميل يلغي طلبه
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound("الطلب مش موجود");

  if (!isAdminSide(req.user) && String(order.user) !== String(req.user._id)) {
    throw ApiError.forbidden("الطلب ده مش بتاعك");
  }
  if (!order.canCancel) {
    throw ApiError.badRequest("الطلب دخل التنفيذ — كلّم الإدارة لو محتاج تلغيه");
  }

  order.status = "cancelled";
  order.statusHistory.push({
    status: "cancelled",
    at: new Date(),
    by: req.user._id,
    note: req.body.reason,
  });
  await order.save();

  // الإدارة لازم تعرف إن العميل لغى
  sendTemplate(
    adminRecipient(),
    orderStatusEmail({
      order,
      statusLabel: "ملغي (بطلب من العميل)",
      note: req.body.reason,
      clientUrl: env.clientUrl,
    }),
  );

  res.json({ success: true, message: "تم إلغاء الطلب", data: { order } });
});

// ===================== الإدارة =====================

// GET /api/orders
export const listOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 15);

  const filter = {};
  if (status && ORDER_STATUSES.includes(status)) filter.status = status;
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ orderNumber: rx }, { "contact.name": rx }, { "contact.phone": rx }];
  }

  const [orders, total, counts] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email"),
    Order.countDocuments(filter),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    results: orders.length,
    pagination: { page, pages: Math.ceil(total / limit), total, limit },
    counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
    data: { orders },
  });
});

// PATCH /api/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, adminNotes } = req.body;

  if (!ORDER_STATUSES.includes(status)) throw ApiError.badRequest("حالة غير معروفة");

  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound("الطلب مش موجود");

  const statusChanged = order.status !== status;

  if (statusChanged) {
    order.status = status;
    order.statusHistory.push({ status, at: new Date(), by: req.user._id, note });
  }
  if (adminNotes !== undefined) order.adminNotes = adminNotes;

  await order.save();

  // العميل بيتبلّغ بس لما الحالة تتغيّر فعلاً (مش مع كل حفظ للملاحظات)
  if (statusChanged) {
    sendTemplate(
      order.contact?.email,
      orderStatusEmail({
        order,
        statusLabel: STATUS_LABELS[status] || status,
        note,
        clientUrl: env.clientUrl,
      }),
      { replyTo: adminRecipient() || undefined },
    );
  }

  res.json({
    success: true,
    message: `تم تحديث الحالة إلى "${STATUS_LABELS[status]}"`,
    data: { order },
  });
});

// GET /api/orders/stats — أرقام الصفحة الرئيسية في الداشبورد
export const orderStats = asyncHandler(async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // بداية الشهر قبل 7 شهور (يعني 8 شهور بالشهر الحالي)
  const trendStart = new Date(startOfMonth);
  trendStart.setMonth(trendStart.getMonth() - 7);

  const [totals, monthly, recent] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(6).select("orderNumber contact total status createdAt"),
  ]);

  const [trend, pending, newCustomers, topProducts, newQuotes, unreadMessages] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: trendStart } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Order.countDocuments({ status: "pending_review" }),
    User.countDocuments({ role: "customer", createdAt: { $gte: startOfMonth } }),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]),
    Quote.countDocuments({ status: "new" }),
    Message.countDocuments({ status: "new" }),
  ]);

  res.json({
    success: true,
    data: {
      allTime: totals[0] || { revenue: 0, orders: 0 },
      thisMonth: monthly[0] || { revenue: 0, orders: 0 },
      pending,
      newQuotes,
      unreadMessages,
      newCustomers,
      recent,
      topProducts: topProducts.map((p) => ({ name: p._id, sold: p.sold, revenue: p.revenue })),
      trend: trend.map((t) => ({
        year: t._id.year,
        month: t._id.month,
        revenue: t.revenue,
        orders: t.orders,
      })),
    },
  });
});
