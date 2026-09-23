import mongoose from "mongoose";

// مستند لكل صفحة، جوّه قيم الحقول اللي الإدارة عدّلتها
//
// ملحوظة مهمة: مفاتيح الحقول في المشروع كلها فيها نقطة (زي "hero.title"
// و"hero.image1") — وMongoose Map بيرفض أي مفتاح فيه نقطة (بيدّي خطأ
// "Mongoose maps do not support keys that contain '.'"). عشان كده
// texts/images هنا Mixed (كائن عادي) مش Map — النوع ده مالوش القيد ده.
const pageContentSchema = new mongoose.Schema(
  {
    _id: { type: String }, // مفتاح الصفحة: home / about / services ...

    // نصوص: { "hero.title": "..." }
    texts: { type: mongoose.Schema.Types.Mixed, default: {} },

    // صور: { "hero.image1": { url, publicId } }
    images: { type: mongoose.Schema.Types.Mixed, default: {} },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, _id: false, minimize: false },
);

export default mongoose.model("PageContent", pageContentSchema);
