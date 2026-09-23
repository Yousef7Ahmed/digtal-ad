/**
 * طبقة تخزين الصور.
 *
 * الافتراضي Cloudinary. لو حبيت ترجع للتخزين المحلي غيّر سطر واحد بس في .env:
 *   STORAGE_DRIVER=local
 *
 * الاتنين بيرجّعوا نفس الشكل: { url, publicId, width, height }
 * فباقي الكود مش فارق معاه الصور متخزنة فين.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const driver = env.storage.driver;

if (driver === "cloudinary") {
  cloudinary.config({
    cloud_name: env.storage.cloudinary.cloudName,
    api_key: env.storage.cloudinary.apiKey,
    api_secret: env.storage.cloudinary.apiSecret,
    secure: true,
  });
}

/** رفع صورة من بافر (multer memoryStorage) */
export async function uploadImage(file, folder = "products") {
  if (!file?.buffer) throw ApiError.badRequest("مفيش ملف مرفوع");

  if (driver === "local") return uploadLocal(file, folder);
  return uploadCloudinary(file, folder);
}

export async function uploadImages(files = [], folder = "products") {
  return Promise.all(files.map((file) => uploadImage(file, folder)));
}

/** حذف صورة بالـ publicId اللي رجع من الرفع */
export async function deleteImage(publicId) {
  if (!publicId) return;

  try {
    if (driver === "local") {
      await fs.unlink(path.resolve(process.cwd(), env.uploadsDir, publicId));
      return;
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // فشل حذف صورة مش سبب إننا نوقف العملية كلها
    console.warn(`⚠️  تعذّر حذف الصورة ${publicId}: ${error.message}`);
  }
}

export async function deleteImages(publicIds = []) {
  await Promise.all(publicIds.filter(Boolean).map(deleteImage));
}

// ===================== Cloudinary =====================
function uploadCloudinary(file, folder) {
  const fullFolder = `${env.storage.cloudinary.folder}/${folder}`;
  const isImage = file.mimetype?.startsWith("image/");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: fullFolder,
        resource_type: isImage ? "image" : "auto", // PDF وباقي الملفات
        // تحسين تلقائي للصور بس
        ...(isImage
          ? {
              transformation: [
                { width: 1600, height: 1600, crop: "limit" },
                { quality: "auto:good", fetch_format: "auto" },
              ],
            }
          : {}),
      },
      (error, result) => {
        if (error) return reject(ApiError.badRequest(`فشل رفع الملف: ${error.message}`));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      },
    );
    stream.end(file.buffer);
  });
}

// ===================== تخزين محلي =====================
async function uploadLocal(file, folder) {
  const dir = path.resolve(process.cwd(), env.uploadsDir, folder);
  await fs.mkdir(dir, { recursive: true });

  const ext = path.extname(file.originalname) || ".jpg";
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  await fs.writeFile(path.join(dir, name), file.buffer);

  return {
    url: `/uploads/${folder}/${name}`,
    publicId: `${folder}/${name}`,
    width: null,
    height: null,
  };
}

export const storageDriver = driver;
