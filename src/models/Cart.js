import mongoose from "mongoose";

// الاختيار اللي العميل حدده في خيار من خيارات المنتج
export const selectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // اسم الخيار: "الكمية"
    choice: { type: String, required: true }, // الاختيار: "1000 كارت"
    priceDelta: { type: Number, default: 0 },
  },
  { _id: false },
);

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    selections: { type: [selectionSchema], default: [] },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("Cart", cartSchema);
