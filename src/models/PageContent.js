import mongoose from "mongoose";

// مستند لكل صفحة، جوّه قيم الحقول اللي الإدارة عدّلتها
const pageContentSchema = new mongoose.Schema(
  {
    _id: { type: String }, // مفتاح الصفحة: home / about / solutions ...

    // نصوص: { "hero.title": "..." }
    texts: { type: Map, of: String, default: {} },

    // صور: { "hero.image1": { url, publicId } }
    images: {
      type: Map,
      of: new mongoose.Schema({ url: String, publicId: String }, { _id: false }),
      default: {},
    },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, _id: false },
);

export default mongoose.model("PageContent", pageContentSchema);
