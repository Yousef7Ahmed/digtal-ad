import mongoose from "mongoose";

// عدّاد ذري لأرقام الطلبات — بيمنع إن طلبين ياخدوا نفس الرقم
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

export async function nextSequence(name, start = 1000) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return counter.seq + start;
}

export default Counter;
