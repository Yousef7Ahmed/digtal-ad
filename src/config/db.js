import mongoose from "mongoose";
import { env } from "./env.js";

/** بيخفي الباسورد قبل ما نطبع الرابط في اللوج */
function maskUri(uri = "") {
  return String(uri).replace(/\/\/([^:]+):([^@]+)@/, "//$1:••••••@");
}

/**
 * رسالة مفيدة بدل ما نسيب رسالة mongoose الجافة.
 * كل سبب من دول بيحصل فعلاً وقت النشر، فبنقول للناس تعمل إيه بالظبط.
 */
function explain(error, uri) {
  const message = error.message || "";

  if (/IP that isn't whitelisted|whitelist|ServerSelectionError|Could not connect to any servers/i.test(message)) {
    return [
      "الأغلب إن عنوان السيرفر مش مسموح له في Atlas.",
      "",
      "الحل: Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0) → Confirm",
      "استنى لحد ما الحالة تبقى Active (دقيقتين تقريبًا) وبعدين أعد النشر.",
      "",
      "ولو مظبوطة خلاص، شوف كمان:",
      "  • الـ Cluster مش متوقّف (Atlas بيوقّف الـ M0 لوحده بعد 60 يوم سكون)",
      "  • اسم اليوزر والباسورد صح في Database Access",
      "  • الرموز الخاصة في الباسورد متكوّدة: @ تبقى %40 و # تبقى %23 و / تبقى %2F",
    ].join("\n");
  }

  if (/bad auth|Authentication failed/i.test(message)) {
    return [
      "اسم المستخدم أو كلمة المرور غلط.",
      "",
      "  • راجعهم من Atlas → Database Access",
      "  • لو الباسورد فيه رموز خاصة لازم تتكوّد:",
      "      @ → %40    # → %23    / → %2F    : → %3A    ? → %3F",
      "  • تأكد إن اسم القاعدة موجود قبل علامة ? في الرابط",
    ].join("\n");
  }

  if (/ECONNREFUSED/i.test(message)) {
    return [
      "مفيش MongoDB شغّالة على العنوان ده.",
      "",
      "  • محليًا: تأكد إن خدمة MongoDB شغّالة على الجهاز",
      "  • على سيرفر: يمكن MONGODB_URI لسه على 127.0.0.1 بدل رابط Atlas",
    ].join("\n");
  }

  if (/ENOTFOUND|querySrv/i.test(message)) {
    return "اسم السيرفر في الرابط غلط أو فيه حرف ناقص — انسخ الرابط تاني من Atlas → Connect → Drivers.";
  }

  return "راجع MONGODB_URI في متغيرات البيئة.";
}

export async function connectDB() {
  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(env.mongoUri, {
      // 15 ثانية بدل 30 — عشان نعرف بسرعة إن فيه مشكلة وقت النشر
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`✅ MongoDB متصلة: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("\n❌ فشل الاتصال بـ MongoDB\n");
    console.error(`الرابط المستخدم: ${maskUri(env.mongoUri)}\n`);
    console.error(`${explain(error, env.mongoUri)}\n`);
    console.error(`تفاصيل الخطأ الأصلي: ${error.message}\n`);

    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
  console.log("🔌 تم قفل الاتصال بـ MongoDB");
}
