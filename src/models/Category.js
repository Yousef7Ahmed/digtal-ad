import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    width: Number,
    height: Number,
  },
  { _id: false },
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم التصنيف مطلوب"],
      trim: true,
      unique: true,
      maxlength: [80, "اسم التصنيف طويل جدًا"],
    },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true, maxlength: 400 },
    icon: { type: String, trim: true, maxlength: 8 }, // إيموجي زي اللي في التصميم
    image: imageSchema,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

categorySchema.index({ sortOrder: 1, name: 1 });

// عدد المنتجات في التصنيف (بيتحسب عند الطلب بـ populate)
categorySchema.virtual("productsCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  count: true,
});

export default mongoose.model("Category", categorySchema);
