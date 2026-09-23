import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    width: Number,
    height: Number,
    alt: String,
  },
  { _id: false },
);

// اختيار جوّه الخيار — مثلاً "500 كارت" بفرق سعر +40 ريال
const choiceSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    priceDelta: { type: Number, default: 0, min: [0, "فرق السعر ما يصحّش يكون بالسالب"] },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

// خيار المنتج — مثلاً "الكمية" أو "الخامة"
const optionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    required: { type: Boolean, default: true },
    choices: {
      type: [choiceSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "لازم الخيار يكون فيه اختيار واحد على الأقل",
      },
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم المنتج مطلوب"],
      trim: true,
      maxlength: [120, "اسم المنتج طويل جدًا"],
    },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 4000 },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "لازم تختار تصنيف للمنتج"],
      index: true,
    },

    // السعر بالريال السعودي
    basePrice: {
      type: Number,
      required: [true, "سعر المنتج مطلوب"],
      min: [0, "السعر ما يصحّش يكون بالسالب"],
    },
    compareAtPrice: { type: Number, min: 0, default: null }, // السعر قبل الخصم
    // لو true بيتعرض "يبدأ من ..." زي ما في التصميم
    priceFrom: { type: Boolean, default: false },

    images: { type: [imageSchema], default: [] },
    options: { type: [optionSchema], default: [] },

    sku: { type: String, trim: true, maxlength: 40 },
    minQuantity: { type: Number, default: 1, min: 1 },
    // null معناها الكمية مفتوحة (منتجات بتتطبع عند الطلب)
    stock: { type: Number, default: null, min: 0 },

    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },

    seo: {
      title: { type: String, trim: true, maxlength: 80 },
      description: { type: String, trim: true, maxlength: 180 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// بحث بالاسم والوصف
productSchema.index({ name: "text", shortDescription: "text", description: "text" });
productSchema.index({ isPublished: 1, isFeatured: -1, sortOrder: 1, createdAt: -1 });

productSchema.virtual("primaryImage").get(function primaryImage() {
  return this.images?.[0]?.url || null;
});

// أقل سعر ممكن للمنتج (السعر الأساسي + أقل فرق في الخيارات المطلوبة)
productSchema.virtual("startingPrice").get(function startingPrice() {
  const required = (this.options || []).filter((o) => o.required);
  const extra = required.reduce((sum, option) => {
    const min = Math.min(...option.choices.map((c) => c.priceDelta || 0));
    return sum + (Number.isFinite(min) ? min : 0);
  }, 0);
  return this.basePrice + extra;
});

productSchema.virtual("inStock").get(function inStock() {
  return this.stock === null || this.stock > 0;
});

export default mongoose.model("Product", productSchema);
