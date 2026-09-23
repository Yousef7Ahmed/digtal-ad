import mongoose from "mongoose";

// عنصر في معرض الأعمال
const workSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "عنوان العمل مطلوب"], trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, index: true },

    // التصنيف المعروض (نص) + الخدمة المرتبطة (slug) للفلترة
    category: { type: String, trim: true, maxlength: 80 },
    service: { type: String, trim: true, index: true },

    client: { type: String, trim: true, maxlength: 120 },
    result: { type: String, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 2000 },

    image: {
      url: String,
      publicId: String,
    },

    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

workSchema.index({ isPublished: 1, sortOrder: 1, createdAt: -1 });

export default mongoose.model("Work", workSchema);
