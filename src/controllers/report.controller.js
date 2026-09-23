import Order from "../models/Order.js";
import User from "../models/User.js";
import Quote from "../models/Quote.js";
import asyncHandler from "../utils/asyncHandler.js";
import { STATUS_LABELS } from "../models/Order.js";

// بيحدد الفترة من الـ query أو آخر 30 يوم افتراضيًا
function parseRange(query) {
  const to = query.to ? new Date(query.to) : new Date();
  to.setHours(23, 59, 59, 999);

  const from = query.from ? new Date(query.from) : new Date(to);
  if (!query.from) from.setDate(from.getDate() - 29);
  from.setHours(0, 0, 0, 0);

  return { from, to };
}

// GET /api/reports/sales?from=&to=&groupBy=day|month
export const salesReport = asyncHandler(async (req, res) => {
  const { from, to } = parseRange(req.query);
  const groupBy = req.query.groupBy === "month" ? "month" : "day";

  const match = { createdAt: { $gte: from, $lte: to }, status: { $ne: "cancelled" } };

  const dateFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

  const [summary, series, byStatus, topProducts, newCustomers, quotesCount, cancelled] =
    await Promise.all([
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
            items: { $sum: { $sum: "$items.quantity" } },
          },
        },
      ]),

      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Order.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        { $group: { _id: "$status", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
        { $sort: { count: -1 } },
      ]),

      Order.aggregate([
        { $match: match },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            sold: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.lineTotal" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),

      User.countDocuments({ role: "customer", createdAt: { $gte: from, $lte: to } }),
      Quote.countDocuments({ createdAt: { $gte: from, $lte: to } }),
      Order.countDocuments({ createdAt: { $gte: from, $lte: to }, status: "cancelled" }),
    ]);

  const totals = summary[0] || { revenue: 0, orders: 0, items: 0 };

  res.json({
    success: true,
    data: {
      range: { from, to, groupBy },
      summary: {
        revenue: Math.round(totals.revenue),
        orders: totals.orders,
        itemsSold: totals.items || 0,
        averageOrder: totals.orders ? Math.round(totals.revenue / totals.orders) : 0,
        newCustomers,
        quotes: quotesCount,
        cancelled,
      },
      series: series.map((s) => ({ key: s._id, revenue: Math.round(s.revenue), orders: s.orders })),
      byStatus: byStatus.map((s) => ({
        status: s._id,
        label: STATUS_LABELS[s._id] || s._id,
        count: s.count,
        revenue: Math.round(s.revenue),
      })),
      topProducts: topProducts.map((p) => ({
        name: p._id,
        sold: p.sold,
        revenue: Math.round(p.revenue),
      })),
    },
  });
});

// GET /api/reports/orders.csv?from=&to= — تصدير الطلبات لإكسل
export const exportOrders = asyncHandler(async (req, res) => {
  const { from, to } = parseRange(req.query);

  const orders = await Order.find({ createdAt: { $gte: from, $lte: to } })
    .sort({ createdAt: -1 })
    .limit(5000);

  const headers = [
    "رقم الطلب",
    "التاريخ",
    "العميل",
    "الجوال",
    "البريد",
    "المنتجات",
    "عدد القطع",
    "الإجمالي",
    "الحالة",
    "المدينة",
  ];

  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const rows = orders.map((order) =>
    [
      order.orderNumber,
      new Date(order.createdAt).toLocaleString("ar-EG"),
      order.contact?.name,
      order.contact?.phone,
      order.contact?.email,
      order.items.map((i) => `${i.name} ×${i.quantity}`).join(" | "),
      order.items.reduce((sum, i) => sum + i.quantity, 0),
      order.total,
      STATUS_LABELS[order.status] || order.status,
      order.address?.city,
    ]
      .map(escape)
      .join(","),
  );

  // BOM عشان إكسل يقرا العربي صح
  const csv = `﻿${headers.map(escape).join(",")}\n${rows.join("\n")}`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="orders-${Date.now()}.csv"`);
  res.send(csv);
});
