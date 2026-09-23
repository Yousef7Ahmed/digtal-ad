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

// الـ refresh token بيتخزن في كوكي httpOnly — الجافاسكربت في المتصفح مش بيوصلّه
export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

export function issueTokens(res, user) {
  const accessToken = signAccessToken(user);
  setRefreshCookie(res, signRefreshToken(user));
  return accessToken;
}
