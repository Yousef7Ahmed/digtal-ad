import mongoose from "mongoose";
import { selectionSchema } from "./Cart.js";

// حالات الطلب بالترتيب
export const ORDER_STATUSES = [
  "pending_review", // وصل وقيد المراجعة
  "confirmed", // اتأكد مع العميل
  "in_production", // قيد التنفيذ
  "ready", // جاهز للتسليم
  "delivered", // اتسلّم
  "cancelled", // ملغي
];

export const STATUS_LABELS = {
  pending_review: "قيد المراجعة",
  confirmed: "مؤكد",
  in_production: "قيد التنفيذ",
  ready: "جاهز للتسليم",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

// نسخة ثابتة من المنتج وقت الطلب — لو السعر اتغيّر بعدين الطلب ما يتأثرش
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    slug: String,
    image: String,
    selections: { type: [selectionSchema], default: [] },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    items: { type: [orderItemSchema], required: true },

    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    vat: { type: Number, default: 0, min: 0 },
    vatIncluded: { type: Boolean, default: false },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "SAR" },

    status: { type: String, enum: ORDER_STATUSES, default: "pending_review", index: true },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: String,
        _id: false,
      },
    ],

    // الدفع لسه مش مفعّل — الحقول دي جاهزة لبوابة الدفع لما تتوصّل
    payment: {
      method: { type: String, default: "pending" }, // لاحقًا: mada / card / transfer
      status: { type: String, default: "unpaid", enum: ["unpaid", "paid", "refunded"] },
      reference: String,
      paidAt: Date,
    },

    contact: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      company: { type: String, trim: true },
    },

    address: {
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      street: { type: String, trim: true },
      details: { type: String, trim: true },
    },

    notes: { type: String, trim: true, maxlength: 1000 },
    adminNotes: { type: String, trim: true, maxlength: 1000 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

orderSchema.index({ createdAt: -1 });

orderSchema.virtual("statusLabel").get(function statusLabel() {
  return STATUS_LABELS[this.status] || this.status;
});

orderSchema.virtual("itemsCount").get(function itemsCount() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// العميل يقدر يلغي طلبه طول ما لسه ما دخلش التنفيذ
orderSchema.virtual("canCancel").get(function canCancel() {
  return ["pending_review", "confirmed"].includes(this.status);
});

export default mongoose.model("Order", orderSchema);
