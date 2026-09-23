import User, { ROLES } from "../models/User.js";
import Order from "../models/Order.js";
import Quote from "../models/Quote.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/users — العملاء أو فريق العمل
export const listUsers = asyncHandler(async (req, res) => {
  const { role = "customer", search, status } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 15);

  const filter = {};
  if (role === "team") filter.role = { $in: ["admin", "staff"] };
  else if (ROLES.includes(role)) filter.role = role;

  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { company: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  // إحصائيات كل عميل: عدد الطلبات، إجمالي المشتريات، آخر طلب، عدد عروض الأسعار
  const ids = users.map((u) => u._id);

  const [orderStats, quoteStats] = await Promise.all([
    Order.aggregate([
      { $match: { user: { $in: ids }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$user",
          orders: { $sum: 1 },
          spent: { $sum: "$total" },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
    ]),
    Quote.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: "$user", quotes: { $sum: 1 } } }]),
  ]);

  const orderMap = new Map(orderStats.map((s) => [String(s._id), s]));
  const quoteMap = new Map(quoteStats.map((s) => [String(s._id), s]));

  const data = users.map((user) => {
    const stats = orderMap.get(String(user._id));
    return {
      ...user.toJSON(),
      ordersCount: stats?.orders || 0,
      totalSpent: Math.round(stats?.spent || 0),
      lastOrderAt: stats?.lastOrderAt || null,
      quotesCount: quoteMap.get(String(user._id))?.quotes || 0,
    };
  });

  res.json({
    success: true,
    results: data.length,
    pagination: { page, pages: Math.ceil(total / limit), total, limit },
    data: { users: data },
  });
});

// GET /api/users/:id — ملف العميل كامل
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("المستخدم مش موجود");

  const [orders, quotes, totals] = await Promise.all([
    Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("orderNumber total status createdAt items"),
    Quote.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("quoteNumber serviceTitle service status quotedAmount createdAt"),
    Order.aggregate([
      { $match: { user: user._id, status: { $ne: "cancelled" } } },
      { $group: { _id: null, orders: { $sum: 1 }, spent: { $sum: "$total" } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      user,
      orders,
      quotes,
      stats: {
        ordersCount: totals[0]?.orders || 0,
        totalSpent: Math.round(totals[0]?.spent || 0),
        quotesCount: quotes.length,
      },
    },
  });
});

// POST /api/users — إنشاء حساب موظف أو مدير
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (await User.exists({ email })) throw ApiError.conflict("فيه حساب بالبريد ده بالفعل");

  const user = await User.create({ name, email, password, phone, role });

  res.status(201).json({ success: true, message: "تم إنشاء الحساب", data: { user } });
});

// PATCH /api/users/:id — تعديل البيانات أو الدور أو التفعيل
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("المستخدم مش موجود");

  const isSelf = String(user._id) === String(req.user._id);
  const { name, phone, company, role, isActive } = req.body;

  if (role !== undefined && role !== user.role) {
    if (isSelf) throw ApiError.badRequest("مش هتقدر تغيّر دورك بنفسك");
    if (user.role === "admin" && (await isLastAdmin(user._id))) {
      throw ApiError.badRequest("ده آخر مدير في النظام — لازم يفضل مدير واحد على الأقل");
    }
    user.role = role;
  }

  if (isActive !== undefined && isActive !== user.isActive) {
    if (isSelf) throw ApiError.badRequest("مش هتقدر توقف حسابك بنفسك");
    if (!isActive && user.role === "admin" && (await isLastAdmin(user._id))) {
      throw ApiError.badRequest("ده آخر مدير في النظام — مش هينفع توقفه");
    }
    user.isActive = isActive;
    // إيقاف الحساب بيلغي جلساته كلها
    if (!isActive) user.tokenVersion += 1;
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (company !== undefined) user.company = company;

  await user.save();

  res.json({ success: true, message: "تم تحديث البيانات", data: { user } });
});

// PATCH /api/users/:id/password — المدير يعيّن كلمة مرور جديدة
export const setUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("المستخدم مش موجود");

  user.password = req.body.newPassword;
  user.tokenVersion += 1; // إلغاء كل جلساته القديمة
  await user.save();

  res.json({ success: true, message: "تم تغيير كلمة المرور وتسجيل خروج الحساب من كل الأجهزة" });
});

// DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("المستخدم مش موجود");

  if (String(user._id) === String(req.user._id)) {
    throw ApiError.badRequest("مش هتقدر تمسح حسابك بنفسك");
  }
  if (user.role === "admin" && (await isLastAdmin(user._id))) {
    throw ApiError.badRequest("ده آخر مدير في النظام");
  }

  const ordersCount = await Order.countDocuments({ user: user._id });
  if (ordersCount > 0) {
    throw ApiError.badRequest(
      `العميل ده عنده ${ordersCount} طلب — أوقف الحساب بدل ما تمسحه عشان سجل الطلبات ما يضيعش`,
    );
  }

  await user.deleteOne();
  res.json({ success: true, message: "تم حذف الحساب" });
});

async function isLastAdmin(excludeId) {
  const count = await User.countDocuments({ role: "admin", _id: { $ne: excludeId } });
  return count === 0;
}
