import mongoose from "mongoose";

export const MESSAGE_STATUSES = ["new", "read", "replied", "archived"];

export const MESSAGE_STATUS_LABELS = {
  new: "جديدة",
  read: "مقروءة",
  replied: "تم الرد",
  archived: "مؤرشفة",
};

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "الاسم مطلوب"], trim: true, maxlength: 80 },
    phone: { type: String, required: [true, "رقم الجوال مطلوب"], trim: true },
    email: { type: String, trim: true, lowercase: true },
    subject: { type: String, required: [true, "الموضوع مطلوب"], trim: true, maxlength: 140 },
    message: { type: String, required: [true, "الرسالة مطلوبة"], trim: true, maxlength: 3000 },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    status: { type: String, enum: MESSAGE_STATUSES, default: "new", index: true },

    reply: {
      text: { type: String, trim: true, maxlength: 3000 },
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      at: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

messageSchema.index({ createdAt: -1 });

messageSchema.virtual("statusLabel").get(function statusLabel() {
  return MESSAGE_STATUS_LABELS[this.status] || this.status;
});

export default mongoose.model("Message", messageSchema);
