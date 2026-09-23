import ApiError from "../utils/ApiError.js";

// بيتحقق من body/params/query باستخدام Zod قبل ما يدخل الـ controller
export default function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(ApiError.badRequest("بيانات غير صالحة", errors));
    }

    // req.query في Express معرّف كـ getter بس، فالإسناد المباشر بيرمي خطأ
    if (source === "body") {
      req.body = result.data;
    } else {
      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    next();
  };
}
