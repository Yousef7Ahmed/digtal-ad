import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { env, isProd } from "./config/env.js";
import routes from "./routes/index.js";
import seoRoutes from "./routes/seo.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
// الواجهة ممكن تكون على دومين تاني خالص (هوستنجر) والـ API هنا (Render)،
// فبنسمح بالدومينات اللي في CLIENT_URL بس — ومعاها الكوكيز
app.use(
  cors({
    origin(origin, callback) {
      // طلبات من غير Origin (Postman، سكربتات السيرفر، فحص الصحة) بتعدّي
      if (!origin) return callback(null, true);

      const clean = origin.replace(/\/+$/, "");
      if (env.allowedOrigins.includes(clean)) return callback(null, true);

      console.warn(`⛔ طلب من دومين مش مسموح: ${origin}`);
      return callback(new Error("الدومين ده مش مسموح له بالوصول للـ API"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (!isProd) app.use(morgan("dev"));

// حد أقصى للطلبات على الـ API
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "طلبات كتير أوي، جرّب تاني بعد شوية." },
  }),
);

// ملفات الصور المرفوعة
app.use("/uploads", express.static(path.resolve(process.cwd(), env.uploadsDir)));

app.use("/api", routes);

// sitemap.xml و robots.txt — على الجذر عشان جوجل بيدوّر عليها هناك
// (لازم تيجي قبل تقديم ملفات الواجهة تحت)
app.use("/", seoRoutes);

// في الإنتاج: نقدّم بناء الواجهة من نفس السيرفر لو المجلد موجود
if (isProd) {
  // بندوّر على بناء الواجهة في أكتر من مكان — كل استضافة بتشغّل السيرفر
  // من مجلد مختلف (هوستنجر، Render، Railway، VPS... كل واحد وطريقته)
  const here = path.dirname(fileURLToPath(import.meta.url)); // server/src
  const candidates = [
    path.resolve(process.cwd(), "../client/dist"), // التشغيل من مجلد server
    path.resolve(process.cwd(), "client/dist"), // التشغيل من جذر المشروع
    path.resolve(here, "../../client/dist"), // بالنسبة لمكان الملف ده
    path.resolve(process.cwd(), "dist"), // الواجهة متحطّة جنب السيرفر
  ];

  const clientDist = candidates.find((dir) => fs.existsSync(path.join(dir, "index.html")));

  if (clientDist) {
    app.use(express.static(clientDist));
    // أي مسار مش /api بيروح لـ index.html عشان React Router يشتغل
    app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(clientDist, "index.html")));
    console.log(`🗂️  بيتم تقديم واجهة العميل من ${clientDist}`);
  } else {
    console.warn(
      "⚠️  مش لاقي بناء الواجهة (client/dist) — السيرفر هيقدّم الـ API بس.\n" +
        "   شغّل: npm run build --prefix client",
    );
  }
}

app.use(notFound);
app.use(errorHandler);

export default app;
