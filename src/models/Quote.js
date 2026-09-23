import mongoose from "mongoose";

export const QUOTE_STATUSES = ["new", "reviewing", "quoted", "accepted", "rejected", "closed"];

export const QUOTE_STATUS_LABELS = {
  new: "جديد",
  reviewing: "تحت الدراسة",
  quoted: "اتبعت العرض",
  accepted: "مقبول",
  rejected: "مرفوض",
  closed: "مقفول",
};

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    name: String,
    size: Number,
  },
  { _id: false },
);

const quoteSchema = new mongoose.Schema(
  {
    quoteNumber: { type: String, required: true, unique: true, index: true },

    // الخدمة المطلوبة — بتيجي من قائمة الخدمات في الموقع
    service: { type: String, required: [true, "لازم تختار الخدمة"], trim: true },
    serviceTitle: { type: String, trim: true },

    budget: { type: String, trim: true },
    timeline: { type: String, trim: true },

    details: { type: String, required: [true, "وصف المشروع مطلوب"], trim: true, maxlength: 4000 },
    goals: { type: String, trim: true, maxlength: 2000 },
    attachments: { type: [attachmentSchema], default: [] },

    contact: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      company: { type: String, trim: true },
    },

    // لو صاحب الطلب كان مسجّل دخول
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

    status: { type: String, enum: QUOTE_STATUSES, default: "new", index: true },
    statusHistory: [
      {
        status: { type: String, enum: QUOTE_STATUSES },
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: String,
        _id: false,
      },
    ],

    // العرض اللي الإدارة بعتته
    quotedAmount: { type: Number, min: 0, default: null },
    quotedNote: { type: String, trim: true, maxlength: 2000 },
    quotedAt: Date,

    adminNotes: { type: String, trim: true, maxlength: 1000 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

quoteSchema.index({ createdAt: -1 });

quoteSchema.virtual("statusLabel").get(function statusLabel() {
  return QUOTE_STATUS_LABELS[this.status] || this.status;
});

export default mongoose.model("Quote", quoteSchema);
