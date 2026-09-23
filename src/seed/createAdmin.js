/**
 * إنشاء أول حساب مدير.
 *
 *   npm run seed:admin
 *
 * بياخد القيم من .env:
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
 * ولو الحساب موجود بيحدّث دوره لـ admin بدل ما يعمل واحد جديد.
 */
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

const name = process.env.ADMIN_NAME || "مدير النظام";
const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD || "";

if (!email || !password) {
  console.error("❌ لازم تحط ADMIN_EMAIL و ADMIN_PASSWORD في ملف .env الأول");
  process.exit(1);
}
if (password.length < 8) {
  console.error("❌ كلمة مرور المدير لازم تكون 8 حروف على الأقل");
  process.exit(1);
}

await connectDB();

const existing = await User.findOne({ email });

if (existing) {
  existing.role = "admin";
  existing.isActive = true;
  existing.password = password;
  existing.tokenVersion += 1;
  await existing.save();
  console.log(`♻️  الحساب موجود — اتحدّث لمدير وكلمة المرور اتغيّرت: ${email}`);
} else {
  await User.create({ name, email, password, role: "admin" });
  console.log(`✅ اتعمل حساب مدير جديد: ${email}`);
}

console.log(`   البيئة: ${env.nodeEnv}`);
await mongoose.connection.close();
process.exit(0);
