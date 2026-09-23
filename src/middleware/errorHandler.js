import { isProd } from "../config/env.js";
import ApiError from "../utils/ApiError.js";

export function notFound(req, res, next) {
  next(ApiError.notFound(`المسار غير موجود: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "حصل خطأ في السيرفر";
  let errors = err.errors;

  // أخطاء Mongoose
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "بيانات غير صالحة";
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }
  if (err.name === "CastError") {
    statusCode = 400;
    message = `قيمة غير صالحة للحقل ${err.path}`;
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = `القيمة مستخدمة بالفعل: ${Object.keys(err.keyValue || {}).join(", ")}`;
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "الجلسة غير صالحة أو منتهية، سجّل دخول تاني";
  }

  if (statusCode >= 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(isProd ? {} : { stack: err.stack }),
  });
}
