/**
 * نقل منتجات وتصنيفات التصميم لقاعدة البيانات.
 *
 *   npm run seed:catalog          # بيضيف الناقص ويسيب الموجود زي ما هو
 *   npm run seed:catalog -- --reset   # بيمسح الكتالوج كله ويبنيه من الأول
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { uniqueSlug } from "../utils/slugify.js";
import { CATEGORIES, PRODUCTS } from "./catalog.data.js";

const reset = process.argv.includes("--reset");

await connectDB();

if (reset) {
  await Promise.all([Product.deleteMany({}), Category.deleteMany({})]);
  console.log("🗑️  اتمسح الكتالوج القديم");
}

// ===== التصنيفات =====
const categoryIds = new Map();

for (const data of CATEGORIES) {
  let category = await Category.findOne({ name: data.name });
  if (!category) {
    category = await Category.create({ ...data, slug: await uniqueSlug(Category, data.name) });
    console.log(`➕ تصنيف: ${category.name}`);
  }
  categoryIds.set(data.name, category._id);
}

// ===== المنتجات =====
let added = 0;
let skipped = 0;

for (const data of PRODUCTS) {
  if (await Product.exists({ name: data.name })) {
    skipped++;
    continue;
  }

  const categoryId = categoryIds.get(data.category);
  if (!categoryId) {
    console.warn(`⚠️  تصنيف مش معروف للمنتج "${data.name}" — اتخطّى`);
    continue;
  }

  await Product.create({
    ...data,
    category: categoryId,
    slug: await uniqueSlug(Product, data.name),
  });
  added++;
}

console.log(`✅ اتضاف ${added} منتج · اتخطّى ${skipped} موجود بالفعل`);
console.log("ℹ️  الصور دلوقتي روابط Unsplash مؤقتة — استبدلها بصور المنتجات الحقيقية من الداشبورد.");

await mongoose.connection.close();
process.exit(0);
