import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`✅ MongoDB متصلة: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ فشل الاتصال بـ MongoDB: ${error.message}`);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
  console.log("🔌 تم قفل الاتصال بـ MongoDB");
}
