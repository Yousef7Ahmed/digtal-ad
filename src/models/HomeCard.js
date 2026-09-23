import mongoose from "mongoose";

/**
 * كارت في قسم "الكروت المميزة" بالصفحة الرئيسية.
 *
 * الكارت = صورة عرضية + عنوان + سطر صغير فوقها.
 * الإدارة بتضيف وتعدّل وتحذف منها من صفحة "كروت الرئيسية" في الداشبورد.
 */
const homeCardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان الكارت مطلوب"],
      trim: true,
      maxlength: [80, "العنوان طويل — خليه مختصر عشان يبان كويس على الصورة"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [120, "السطر الصغير طويل جدًا"],
    },

    image: {
      url: String,
      publicId: String,
    },

    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

homeCardSchema.index({ isActive: 1, sortOrder: 1, createdAt: 1 });

export default mongoose.model("HomeCard", homeCardSchema);
