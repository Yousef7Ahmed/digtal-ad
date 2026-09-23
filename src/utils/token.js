import jwt from "jsonwebtoken";
import { env, isProd } from "../config/env.js";

export const REFRESH_COOKIE = "da_refresh";

export function signAccessToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: String(user._id), ver: user.tokenVersion },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.secret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

/**
 * خصائص كوكي الجلسة.
 *
 * الوضع الافتراضي `sameSite: "lax"` معناه إن الكوكي **عمره ما يعدّي بين
 * دومينين مختلفين** — وده اللي احنا عايزينه. عشان كده لازم الـ API يكون
 * على دومين فرعي من نفس الدومين (api.digitalad.sa) مش على دومين غريب.
 *
 * دومين فرعي = نفس الموقع في نظر المتصفّح، فالكوكي بيشتغل عادي
 * ويفضل طرف أول، وسفاري وكروم مش بيتدخّلوا فيه.
 */
function cookieOptions() {
  const { sameSite, domain } = env.cookie;

  return {
    httpOnly: true, // الجافاسكربت في المتصفح مش بيوصلّه
    // sameSite=none مالوش معنى من غير https، فالمتصفّح بيرفضه
    secure: isProd || sameSite === "none",
    sameSite,
    ...(domain ? { domain } : {}),
    path: "/api/auth",
  };
}

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    ...cookieOptions(),
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
  });
}

// لازم نفس الخصائص بالظبط وإلا المتصفّح مش هيلاقي الكوكي عشان يمسحه
export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
}

export function issueTokens(res, user) {
  const accessToken = signAccessToken(user);
  setRefreshCookie(res, signRefreshToken(user));
  return accessToken;
}
