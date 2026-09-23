// خطأ معروف بنرميه من أي مكان في التطبيق وبيتحول لرد JSON منظم
export default class ApiError extends Error {
  constructor(statusCode, message, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "طلب غير صالح", errors) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "غير مصرّح لك بالدخول") {
    return new ApiError(401, message);
  }

  static forbidden(message = "ليس لديك صلاحية لهذا الإجراء") {
    return new ApiError(403, message);
  }

  static notFound(message = "العنصر المطلوب غير موجود") {
    return new ApiError(404, message);
  }

  static conflict(message = "العنصر موجود بالفعل") {
    return new ApiError(409, message);
  }

  static internal(message = "حصلت مشكلة عندنا، جرّب تاني بعد شوية") {
    return new ApiError(500, message);
  }
}
