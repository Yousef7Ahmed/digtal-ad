import mongoose from "mongoose";

// مستند واحد بس في الكولكشن دي (id ثابت = "site")
const settingSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "site" },

    company: {
      name: { type: String, trim: true, default: "Digital AD" },
      nameAr: { type: String, trim: true, default: "وكالة الإعلان الرقمي" },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      website: { type: String, trim: true },
      address: { type: String, trim: true },
      founded: { type: String, trim: true },
      about: { type: String, trim: true, maxlength: 2000 },
      vision: { type: String, trim: true, maxlength: 1000 },
      mission: { type: String, trim: true, maxlength: 1000 },
      workingHours: { type: String, trim: true },
    },

    social: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      tiktok: { type: String, trim: true },
      snapchat: { type: String, trim: true },
      youtube: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
    },

    // زر الواتساب العائم في الموقع
    whatsapp: {
      enabled: { type: Boolean, default: false },
      // الرقم بأي شكل — السيرفر بينضّفه قبل التخزين
      number: { type: String, trim: true, default: "" },
      // الرسالة اللي بتتكتب للعميل جاهزة أول ما يضغط
      message: { type: String, trim: true, maxlength: 300, default: "السلام عليكم، حابب أستفسر عن خدماتكم" },
      // البالونة اللي بتظهر جنب الزرار
      tooltip: { type: String, trim: true, maxlength: 60, default: "محتاج مساعدة؟ كلّمنا" },
      position: { type: String, enum: ["right", "left"], default: "left" },
    },

    // تحسين محركات البحث
    seo: {
      // العنوان الأساسي للموقع (بيظهر في تبويب المتصفّح ونتايج جوجل)
      siteName: { type: String, trim: true, maxlength: 80, default: "Digital AD" },
      defaultTitle: {
        type: String,
        trim: true,
        maxlength: 70,
        default: "Digital AD | وكالة الإعلان الرقمي",
      },
      // %s بتتبدل بعنوان الصفحة
      titleTemplate: { type: String, trim: true, maxlength: 60, default: "%s | Digital AD" },
      defaultDescription: {
        type: String,
        trim: true,
        maxlength: 300,
        default:
          "وكالة إعلان رقمي في الرياض متخصصة في الدعاية والإعلان، الطباعة، تجهيز المعارض، والهدايا الدعائية منذ 2017.",
      },
      keywords: {
        type: String,
        trim: true,
        maxlength: 300,
        default: "دعاية وإعلان، طباعة، الرياض، هدايا دعائية، تجهيز معارض، تصميم",
      },
      // دومين الموقع بعد النشر — بيتستخدم في canonical و sitemap
      siteUrl: { type: String, trim: true, default: "" },
      // الصورة اللي بتظهر لما اللينك يتبعت على واتساب/تويتر
      ogImage: { type: String, trim: true, default: "" },
      twitterHandle: { type: String, trim: true, maxlength: 40, default: "" },
      // G-XXXXXXXXXX من Google Analytics 4
      gaId: { type: String, trim: true, maxlength: 40, default: "" },
      // كود التحقق من Google Search Console
      searchConsole: { type: String, trim: true, maxlength: 120, default: "" },
      // اقفلها لو الموقع لسه تحت التجربة وما تحبش جوجل يفهرسه
      indexable: { type: Boolean, default: true },
    },

    // الأرقام اللي بتظهر في الصفحة الرئيسية
    stats: {
      type: [
        {
          num: { type: String, trim: true, required: true },
          label: { type: String, trim: true, required: true },
          _id: false,
        },
      ],
      default: [],
    },

    // آراء العملاء
    testimonials: {
      type: [
        {
          name: { type: String, trim: true, required: true },
          role: { type: String, trim: true },
          text: { type: String, trim: true, required: true, maxlength: 600 },
          avatar: { type: String, trim: true, maxlength: 4 },
          _id: false,
        },
      ],
      default: [],
    },
  },
  { timestamps: true, _id: false },
);

const Setting = mongoose.model("Setting", settingSchema);

/** بيرجّع مستند الإعدادات، ويعمله لو لسه مش موجود */
export async function getSiteSettings() {
  const existing = await Setting.findById("site");
  return existing || Setting.create({ _id: "site" });
}

export default Setting;
