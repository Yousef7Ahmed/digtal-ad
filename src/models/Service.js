import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "اسم الخدمة مطلوب"],
      trim: true,
      unique: true,
      maxlength: 120,
    },
    slug: { type: String, required: true, unique: true, index: true },

    icon: { type: String, trim: true, maxlength: 8, default: "✨" }, // إيموجي زي التصميم
    color: { type: String, trim: true, default: "#1ABCAC" },

    shortDesc: { type: String, trim: true, maxlength: 300 },
    desc: { type: String, trim: true, maxlength: 3000 },
    features: { type: [String], default: [] },
    price: { type: String, trim: true, maxlength: 80 }, // نص زي "حسب المساحة"

    image: {
      url: String,
      publicId: String,
    },

    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

serviceSchema.index({ sortOrder: 1, createdAt: 1 });

export default mongoose.model("Service", serviceSchema);
