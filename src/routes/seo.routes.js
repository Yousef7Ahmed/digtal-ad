/**
 * sitemap.xml و robots.txt.
 *
 * المسارات دي بتتركّب على جذر السيرفر (مش تحت /api) عشان جوجل
 * بيدوّر عليها في https://example.com/sitemap.xml بالظبط.
 *
 * النتيجة بتتخزّن في الذاكرة 10 دقايق — مفيش داعي نضرب القاعدة
 * مع كل زيارة من بوت.
 */
import { Router } from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { getSiteSettings } from "../models/Setting.js";
import { env } from "../config/env.js";

const router = Router();

const CACHE_MS = 10 * 60 * 1000;
let cache = { xml: "", at: 0 };

// الصفحات الثابتة + أولويتها عند محركات البحث
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/store", priority: "0.9", changefreq: "daily" },
  { path: "/services", priority: "0.8", changefreq: "monthly" },
  { path: "/portfolio", priority: "0.7", changefreq: "weekly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "yearly" },
  { path: "/request", priority: "0.7", changefreq: "yearly" },
];

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** دومين الموقع: من الإعدادات الأول، وبعدين من .env */
async function resolveBaseUrl(req) {
  const settings = await getSiteSettings();
  const fromSettings = settings.seo?.siteUrl?.trim();
  if (fromSettings) return fromSettings.replace(/\/+$/, "");

  if (env.clientUrl) return env.clientUrl.replace(/\/+$/, "");
  return `${req.protocol}://${req.get("host")}`;
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString().split("T")[0]}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// GET /sitemap.xml
router.get("/sitemap.xml", async (req, res) => {
  try {
    if (cache.xml && Date.now() - cache.at < CACHE_MS) {
      res.type("application/xml").send(cache.xml);
      return;
    }

    const base = await resolveBaseUrl(req);

    const [products, categories] = await Promise.all([
      Product.find({ isPublished: true }).select("slug updatedAt").sort({ updatedAt: -1 }).limit(2000).lean(),
      Category.find({ isActive: { $ne: false } }).select("slug updatedAt").limit(200).lean(),
    ]);

    const entries = [
      ...STATIC_PAGES.map((page) =>
        urlEntry({ loc: `${base}${page.path}`, changefreq: page.changefreq, priority: page.priority }),
      ),
      ...categories.map((category) =>
        urlEntry({
          loc: `${base}/store?category=${encodeURIComponent(category.slug)}`,
          lastmod: category.updatedAt,
          changefreq: "weekly",
          priority: "0.7",
        }),
      ),
      ...products.map((product) =>
        urlEntry({
          loc: `${base}/product/${encodeURIComponent(product.slug)}`,
          lastmod: product.updatedAt,
          changefreq: "weekly",
          priority: "0.8",
        }),
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

    cache = { xml, at: Date.now() };
    res.type("application/xml").send(xml);
  } catch (error) {
    console.error(`❌ فشل توليد sitemap: ${error.message}`);
    res.status(500).type("text/plain").send("sitemap unavailable");
  }
});

// GET /robots.txt
router.get("/robots.txt", async (req, res) => {
  try {
    const settings = await getSiteSettings();
    const base = await resolveBaseUrl(req);
    const indexable = settings.seo?.indexable !== false;

    const lines = indexable
      ? [
          "User-agent: *",
          "Allow: /",
          // صفحات مالهاش لازمة في نتايج البحث
          "Disallow: /admin",
          "Disallow: /account",
          "Disallow: /cart",
          "Disallow: /checkout",
          "Disallow: /orders",
          "Disallow: /quotes",
          "Disallow: /reset-password",
          "Disallow: /api/",
          "",
          `Sitemap: ${base}/sitemap.xml`,
        ]
      : ["User-agent: *", "Disallow: /"];

    res.type("text/plain").send(lines.join("\n"));
  } catch {
    res.type("text/plain").send("User-agent: *\nAllow: /");
  }
});

/** بننده عليها بعد أي تعديل على المنتجات عشان الخريطة تتجدد */
export function clearSitemapCache() {
  cache = { xml: "", at: 0 };
}

export default router;
