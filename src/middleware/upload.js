import multer from "multer";
import ApiError from "../utils/ApiError.js";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

// بنستقبل الملف في الذاكرة وبعدين نرفعه للتخزين (Cloudinary أو محلي)
const storage = multer.memoryStorage();

const ATTACHMENTS = [
  ...ALLOWED,
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/postscript", // ملفات Illustrator
];

export const uploadImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 }, // 5 ميجا للصورة، 8 صور بالكتير
  fileFilter(req, file, cb) {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(ApiError.badRequest("الصيغة مش مدعومة — استخدم JPG أو PNG أو WEBP"));
    }
    cb(null, true);
  },
});

// رسائل أوضح لأخطاء multer
export function uploadErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(ApiError.badRequest("حجم الملف أكبر من المسموح"));
    }
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(ApiError.badRequest("عدد الملفات أكبر من المسموح"));
    }
    return next(ApiError.badRequest(`مشكلة في رفع الملف: ${err.message}`));
  }
  next(err);
}

// مرفقات طلبات عروض الأسعار — صور أو PDF أو ZIP
export const uploadAttachments = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }, // 10 ميجا للملف، 5 ملفات
  fileFilter(req, file, cb) {
    if (!ATTACHMENTS.includes(file.mimetype)) {
      return cb(ApiError.badRequest("الصيغة مش مدعومة — صور أو PDF أو ZIP بس"));
    }
    cb(null, true);
  },
});
