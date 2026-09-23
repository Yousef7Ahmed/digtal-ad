import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "JWT_SECRET"];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`❌ متغيرات البيئة الناقصة: ${missing.join(", ")} — راجع ملف .env`);
  process.exit(1);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  // الدومين الأساسي للموقع — بيتستخدم في روابط الإيميل والـ sitemap و canonical
  clientUrl: (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim().replace(/\/+$/, ""),

  // كل الدومينات المسموح لها تنادي الـ API (مفصولة بفاصلة).
  // لازمة لما الواجهة تكون على استضافة والـ API على استضافة تانية،
  // أو لما يكون فيه www وبدون www.
  allowedOrigins: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean),

  uploadsDir: process.env.UPLOADS_DIR || "uploads",

  // ===== الإيميل =====
  // لو SMTP_HOST مش متحط، الإشعارات بتتسجّل في الكونسول بس والسيرفر بيفضل شغّال عادي
  mail: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    // secure=true مع بورت 465، و false مع 587 (بيعمل STARTTLS)
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : Number(process.env.SMTP_PORT) === 465,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.MAIL_FROM || "Digital AD <no-reply@digitalad.sa>",
    // الإيميل اللي بتوصله إشعارات الإدارة (طلب جديد / رسالة جديدة)
    adminEmail: process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || "",
    replyTo: process.env.MAIL_REPLY_TO || "",
  },

  // مدة صلاحية رابط استعادة كلمة المرور (بالدقايق)
  passwordResetMinutes: Number(process.env.PASSWORD_RESET_MINUTES) || 60,

  // ===== كوكي الجلسة =====
  cookie: {
    // lax  = الواجهة والـ API تحت نفس الدومين (digitalad.sa و api.digitalad.sa)
    //        ← الافتراضي، والأأمن، ومفيش أي كوكي بيعدّي بين دومينين
    // none = دومينين مختلفين تمامًا (digitalad.sa و xxx.onrender.com)
    //        ← بيشتغل بس سفاري بيمنعه وكروم بيضيّق عليه
    sameSite: ["lax", "none", "strict"].includes((process.env.COOKIE_SAMESITE || "").toLowerCase())
      ? process.env.COOKIE_SAMESITE.toLowerCase()
      : "lax",

    // سيبه فاضي في الحالة العادية — الكوكي بيتحفظ لدومين الـ API لوحده
    // وده اللي احنا عايزينه. املاه بس لو محتاج الكوكي يشتغل على أكتر من
    // دومين فرعي، مثلاً: .digitalad.sa
    domain: (process.env.COOKIE_DOMAIN || "").trim(),
  },

  storage: {
    // cloudinary (الافتراضي) أو local
    driver: (process.env.STORAGE_DRIVER || "cloudinary").toLowerCase(),
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      folder: process.env.CLOUDINARY_FOLDER || "digital-adstore",
    },
  },
};

// لو التخزين على Cloudinary لازم المفاتيح تكون موجودة
if (env.storage.driver === "cloudinary") {
  const c = env.storage.cloudinary;
  if (!c.cloudName || !c.apiKey || !c.apiSecret) {
    console.error(
      "❌ مفاتيح Cloudinary ناقصة (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET).\n" +
        "   حطها في .env، أو استخدم STORAGE_DRIVER=local للتخزين المحلي.",
    );
    process.exit(1);
  }
}

export const isProd = env.nodeEnv === "production";

// تنبيه لو الجلسة معتمدة على كوكي طرف تالت — ده بيقع عند ناس كتير
// من غير ما تعرف السبب، فالأحسن يبان في اللوج من أول ثانية
if (env.cookie.sameSite === "none") {
  console.warn(
    "⚠️  COOKIE_SAMESITE=none — يعني كوكي الجلسة بيعدّي بين دومينين مختلفين.\n" +
      "   سفاري بيمنع ده افتراضيًا وكروم بيضيّق عليه، والنتيجة إن العملاء\n" +
      "   هيتسجّل خروجهم من غير سبب واضح.\n" +
      "   الحل: حط الـ API على دومين فرعي من دومين الموقع (api.example.com)\n" +
      "   وبعدين شيل المتغير ده أو خليه lax.",
  );
}

if (isProd && env.allowedOrigins.some((url) => url.startsWith("http://"))) {
  console.warn("⚠️  فيه دومين في CLIENT_URL شغّال على http مش https — الكوكي مش هيشتغل معاه.");
}
