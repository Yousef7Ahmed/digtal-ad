// بيلف أي controller عشان أي throw يروح لـ error handler من غير try/catch في كل مكان
export default function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
