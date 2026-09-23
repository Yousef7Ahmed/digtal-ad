/**
 * نقل خدمات ومعرض أعمال التصميم لقاعدة البيانات.
 *
 *   npm run seed:content            # بيضيف الناقص ويسيب الموجود
 *   npm run seed:content -- --reset # بيمسح المحتوى ويبنيه من الأول
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Service from "../models/Service.js";
import Work from "../models/Work.js";
import { slugify, uniqueSlug } from "../utils/slugify.js";
import { getSiteSettings } from "../models/Setting.js";
import { SERVICES, PORTFOLIO, STATS, TESTIMONIALS, COMPANY } from "./content.data.js";

const reset = process.argv.includes("--reset");

await connectDB();

if (reset) {
  await Promise.all([Service.deleteMany({}), Work.deleteMany({})]);
  console.log("🗑️  اتمسح المحتوى القديم");
}

// ===== الخدمات =====
let servicesAdded = 0;

for (const [index, data] of SERVICES.entries()) {
  if (await Service.exists({ title: data.title })) continue;

  await Service.create({
    title: data.title,
    // بنحافظ على نفس الـ id بتاع التصميم عشان الروابط القديمة تفضل شغّالة
    slug: data.id || slugify(data.title),
    icon: data.icon,
    color: data.color,
    shortDesc: data.shortDesc,
    desc: data.desc,
    features: data.features || [],
    price: data.price,
    sortOrder: index + 1,
  });
  servicesAdded++;
}

// ===== معرض الأعمال =====
let worksAdded = 0;

for (const [index, data] of PORTFOLIO.entries()) {
  if (await Work.exists({ title: data.title })) continue;

  await Work.create({
    title: data.title,
    slug: await uniqueSlug(Work, data.title),
    category: data.category,
    service: data.cat,
    client: data.client,
    result: data.result,
    description: data.desc,
    image: data.img ? { url: data.img } : undefined,
    sortOrder: index + 1,
  });
  worksAdded++;
}

// ===== إعدادات الموقع =====
const settings = await getSiteSettings();

if (reset || !settings.company?.phone) {
  settings.company = {
    name: COMPANY.name,
    nameAr: COMPANY.nameAr,
    phone: COMPANY.phone,
    email: COMPANY.email,
    website: COMPANY.website,
    address: COMPANY.address,
    founded: COMPANY.founded,
    about: COMPANY.about,
    vision: COMPANY.vision,
    mission: COMPANY.mission,
  };
  settings.stats = STATS;
  settings.testimonials = TESTIMONIALS;
  await settings.save();
  console.log("⚙️  اتحفظت بيانات الشركة والإحصائيات وآراء العملاء");
}

console.log(`✅ اتضاف ${servicesAdded} خدمة و ${worksAdded} عمل`);
console.log("ℹ️  صور الأعمال لسه روابط Unsplash مؤقتة — استبدلها من صفحة معرض الأعمال في الداشبورد.");

await mongoose.connection.close();
process.exit(0);
