/**
 * قوالب الإيميل — كلها عربي RTL وبنفس هوية Digital AD.
 *
 * كل دالة بترجّع { subject, html, text }.
 * الـ HTML مكتوب بجداول عن قصد — ده الشكل الوحيد اللي بيتعرض صح
 * في Gmail و Outlook و تطبيقات الموبايل.
 */

const BRAND = {
  teal: "#1ABCAC",
  tealDark: "#138f82",
  orange: "#E84A16",
  ink: "#0d2d2a",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f4f6f8",
};

const FONT = "'Segoe UI', Tahoma, Arial, sans-serif";

/** بيمنع أي HTML جاي من المستخدم إنه يتنفّذ جوه الإيميل */
export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// نفس تنسيق الأسعار اللي في الموقع (client/src/lib/price.js)
const money = (n) =>
  `${Number(n || 0).toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ر.س`;

// ar-EG عشان التاريخ ميلادي بأسماء شهور عربية —
// ar-SA بترجع هجري وده بيلخبط العملاء
const dateAr = (d) =>
  new Date(d || Date.now()).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/** الإطار الخارجي المشترك لكل الإيميلات */
function shell({ title, preheader = "", body, footerNote = "" }) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

        <tr>
          <td style="background:${BRAND.ink};padding:26px 28px;text-align:right;">
            <div style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.3px;">
              Digital <span style="color:${BRAND.teal};">AD</span>
            </div>
            <div style="color:rgba(255,255,255,0.65);font-size:13px;margin-top:4px;">وكالة الإعلان الرقمي</div>
          </td>
        </tr>

        <tr><td style="padding:30px 28px;text-align:right;color:#1f2937;font-size:15px;line-height:1.9;">
          ${body}
        </td></tr>

        <tr>
          <td style="background:#fafafa;border-top:1px solid ${BRAND.border};padding:20px 28px;text-align:right;color:${BRAND.muted};font-size:12px;line-height:1.8;">
            ${footerNote ? `<div style="margin-bottom:8px;">${footerNote}</div>` : ""}
            <div>Digital AD — وكالة الإعلان الرقمي · الرياض، المملكة العربية السعودية</div>
            <div style="margin-top:4px;">الرسالة دي تلقائية، مش محتاجة رد.</div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function heading(text) {
  return `<h1 style="margin:0 0 14px;font-size:21px;font-weight:800;color:${BRAND.ink};">${esc(text)}</h1>`;
}

function paragraph(text) {
  return `<p style="margin:0 0 14px;color:#374151;">${text}</p>`;
}

function button(label, url, color = BRAND.teal) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;">
    <tr><td style="background:${color};border-radius:999px;">
      <a href="${esc(url)}" style="display:inline-block;padding:13px 30px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">${esc(label)}</a>
    </td></tr>
  </table>`;
}

/** صندوق معلومات (سطر عنوان + قيمة) */
function infoBox(rows) {
  const cells = rows
    .filter((r) => r && r[1] !== undefined && r[1] !== null && r[1] !== "")
    .map(
      ([label, value]) => `<tr>
        <td style="padding:7px 0;color:${BRAND.muted};font-size:13px;white-space:nowrap;">${esc(label)}</td>
        <td style="padding:7px 0 7px 12px;color:#111827;font-size:14px;font-weight:600;">${value}</td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="background:#f8fafc;border:1px solid ${BRAND.border};border-radius:12px;padding:8px 16px;margin:6px 0 18px;">
    ${cells}
  </table>`;
}

/** جدول منتجات الطلب */
function itemsTable(items = []) {
  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};text-align:right;">
          <div style="font-weight:700;color:#111827;font-size:14px;">${esc(item.name)}</div>
          ${
            item.selections?.length
              ? `<div style="color:${BRAND.muted};font-size:12px;margin-top:3px;">${item.selections
                  .map((s) => `${esc(s.name)}: ${esc(s.choice)}`)
                  .join(" · ")}</div>`
              : ""
          }
          <div style="color:${BRAND.muted};font-size:12px;margin-top:3px;">العدد: ${esc(item.quantity)} ×</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};text-align:left;white-space:nowrap;color:#111827;font-weight:700;font-size:14px;">
          ${esc(money(item.lineTotal))}
        </td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">${rows}</table>`;
}

function totalsBlock(order) {
  const lines = [];
  if (order.vat > 0) lines.push(["الضريبة", money(order.vat)]);
  if (order.shipping > 0) lines.push(["الشحن", money(order.shipping)]);
  if (order.discount > 0) lines.push(["الخصم", `- ${money(order.discount)}`]);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;">
    <tr>
      <td style="padding:6px 0;color:${BRAND.muted};font-size:13px;">الإجمالي الفرعي</td>
      <td style="padding:6px 0;text-align:left;color:#374151;font-size:14px;">${esc(money(order.subtotal))}</td>
    </tr>
    ${lines
      .map(
        ([l, v]) => `<tr>
          <td style="padding:6px 0;color:${BRAND.muted};font-size:13px;">${esc(l)}</td>
          <td style="padding:6px 0;text-align:left;color:#374151;font-size:14px;">${esc(v)}</td>
        </tr>`,
      )
      .join("")}
    <tr>
      <td style="padding:12px 0 0;border-top:2px solid ${BRAND.ink};color:${BRAND.ink};font-size:16px;font-weight:800;">الإجمالي</td>
      <td style="padding:12px 0 0;border-top:2px solid ${BRAND.ink};text-align:left;color:${BRAND.teal};font-size:18px;font-weight:800;">${esc(money(order.total))}</td>
    </tr>
  </table>`;
}

/** بيحوّل HTML لنسخة نصية بسيطة (للعملاء اللي بيقفلوا الـ HTML) */
function toText(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h1|h2|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

function build(subject, html, footerNote, preheader) {
  const full = shell({ title: subject, body: html, footerNote, preheader });
  return { subject, html: full, text: toText(full) };
}

// ===================================================================
//                            القوالب
// ===================================================================

/** ترحيب بعد إنشاء الحساب */
export function welcomeEmail({ user, clientUrl }) {
  const body =
    heading(`أهلاً بك يا ${esc(user.name.split(" ")[0])} 👋`) +
    paragraph("تم إنشاء حسابك في <strong>Digital AD</strong> بنجاح. دلوقتي تقدر تتصفّح المتجر، تطلب خدمة، وتتابع طلباتك أول بأول من مكان واحد.") +
    button("ابدأ التصفّح", `${clientUrl}/store`) +
    paragraph(`لو محتاج أي مساعدة، رد على الرسالة دي أو كلّمنا من <a href="${esc(clientUrl)}/contact" style="color:${BRAND.teal};font-weight:700;">صفحة التواصل</a>.`);

  return build("أهلاً بك في Digital AD", body, "", "حسابك جاهز — ابدأ من هنا");
}

/** تأكيد وصول الطلب — للعميل */
export function orderPlacedEmail({ order, clientUrl }) {
  const body =
    heading("وصلنا طلبك ✅") +
    paragraph(`شكرًا لك يا ${esc(order.contact?.name || "عميلنا العزيز")}. استلمنا طلبك وفريقنا هيراجعه ويتواصل معك للتأكيد.`) +
    infoBox([
      ["رقم الطلب", `<span style="color:${BRAND.teal};font-weight:800;">${esc(order.orderNumber)}</span>`],
      ["تاريخ الطلب", esc(dateAr(order.createdAt))],
      ["الحالة", "قيد المراجعة"],
    ]) +
    `<div style="font-weight:800;color:${BRAND.ink};margin:18px 0 4px;">تفاصيل الطلب</div>` +
    itemsTable(order.items) +
    totalsBlock(order) +
    button("تابع حالة الطلب", `${clientUrl}/orders/${order._id}`) +
    paragraph(`<span style="color:${BRAND.muted};font-size:13px;">الدفع بيتم بالتنسيق مع فريقنا بعد تأكيد الطلب.</span>`);

  return build(
    `تأكيد الطلب ${order.orderNumber} — Digital AD`,
    body,
    "",
    `طلبك ${order.orderNumber} وصلنا بنجاح`,
  );
}

/** إشعار الإدارة بطلب جديد */
export function orderPlacedAdminEmail({ order, clientUrl }) {
  const body =
    heading("🛒 طلب جديد على المتجر") +
    infoBox([
      ["رقم الطلب", `<span style="color:${BRAND.orange};font-weight:800;">${esc(order.orderNumber)}</span>`],
      ["الإجمالي", esc(money(order.total))],
      ["العميل", esc(order.contact?.name)],
      ["الجوال", esc(order.contact?.phone)],
      ["البريد", esc(order.contact?.email)],
      ["الشركة", esc(order.contact?.company)],
      [
        "العنوان",
        esc([order.address?.city, order.address?.district, order.address?.street].filter(Boolean).join("، ")),
      ],
      ["ملاحظات العميل", esc(order.notes)],
    ]) +
    itemsTable(order.items) +
    totalsBlock(order) +
    button("افتح الطلب في اللوحة", `${clientUrl}/admin/orders`, BRAND.orange);

  return build(
    `طلب جديد ${order.orderNumber} — ${money(order.total)}`,
    body,
    "",
    `${order.contact?.name || ""} — ${money(order.total)}`,
  );
}

/** تغيّر حالة الطلب — للعميل */
export function orderStatusEmail({ order, statusLabel, note, clientUrl }) {
  const cancelled = order.status === "cancelled";
  const body =
    heading(cancelled ? "تم إلغاء طلبك" : "تحديث على طلبك") +
    paragraph(`طلبك رقم <strong style="color:${BRAND.teal};">${esc(order.orderNumber)}</strong> بقى في حالة:`) +
    `<div style="display:inline-block;background:${cancelled ? "#fef2f2" : "#e8f8f7"};color:${cancelled ? "#b91c1c" : BRAND.tealDark};border-radius:999px;padding:9px 22px;font-weight:800;font-size:15px;margin-bottom:16px;">${esc(statusLabel)}</div>` +
    (note ? paragraph(`<span style="color:${BRAND.muted};">ملاحظة الفريق:</span> ${esc(note)}`) : "") +
    infoBox([
      ["الإجمالي", esc(money(order.total))],
      ["عدد المنتجات", esc(order.items?.length || 0)],
    ]) +
    button("عرض تفاصيل الطلب", `${clientUrl}/orders/${order._id}`);

  return build(
    `طلبك ${order.orderNumber}: ${statusLabel}`,
    body,
    "",
    `الحالة الجديدة: ${statusLabel}`,
  );
}

/** تأكيد استلام طلب عرض سعر — للعميل */
export function quoteReceivedEmail({ quote, clientUrl }) {
  const body =
    heading("استلمنا طلب عرض السعر 📝") +
    paragraph(`شكرًا لك يا ${esc(quote.contact?.name || "عميلنا العزيز")}. طلبك تحت المراجعة وهنبعتلك عرض سعر مفصّل في أقرب وقت.`) +
    infoBox([
      ["رقم الطلب", `<span style="color:${BRAND.teal};font-weight:800;">${esc(quote.quoteNumber)}</span>`],
      ["الخدمة", esc(quote.serviceTitle || quote.service)],
      ["الميزانية التقريبية", esc(quote.budget)],
      ["المدة المطلوبة", esc(quote.timeline)],
      ["التاريخ", esc(dateAr(quote.createdAt))],
    ]) +
    (quote.details
      ? paragraph(`<span style="color:${BRAND.muted};">تفاصيل طلبك:</span><br>${esc(quote.details)}`)
      : "") +
    button("تابع طلباتك", `${clientUrl}/quotes`);

  return build(
    `استلمنا طلبك ${quote.quoteNumber} — Digital AD`,
    body,
    "",
    `طلب عرض السعر ${quote.quoteNumber} تحت المراجعة`,
  );
}

/** إشعار الإدارة بطلب عرض سعر جديد */
export function quoteReceivedAdminEmail({ quote, clientUrl }) {
  const body =
    heading("📝 طلب عرض سعر جديد") +
    infoBox([
      ["رقم الطلب", `<span style="color:${BRAND.orange};font-weight:800;">${esc(quote.quoteNumber)}</span>`],
      ["الخدمة", esc(quote.serviceTitle || quote.service)],
      ["الميزانية", esc(quote.budget)],
      ["المدة", esc(quote.timeline)],
      ["العميل", esc(quote.contact?.name)],
      ["الجوال", esc(quote.contact?.phone)],
      ["البريد", esc(quote.contact?.email)],
      ["الشركة", esc(quote.contact?.company)],
      ["المرفقات", quote.attachments?.length ? `${quote.attachments.length} ملف` : ""],
    ]) +
    (quote.details ? paragraph(`<strong>التفاصيل:</strong><br>${esc(quote.details)}`) : "") +
    (quote.goals ? paragraph(`<strong>الأهداف:</strong><br>${esc(quote.goals)}`) : "") +
    button("افتح الطلب في اللوحة", `${clientUrl}/admin/quotes`, BRAND.orange);

  return build(
    `طلب عرض سعر جديد ${quote.quoteNumber}`,
    body,
    "",
    `${quote.contact?.name || ""} — ${quote.serviceTitle || ""}`,
  );
}

/** إرسال عرض السعر أو تحديث حالته — للعميل */
export function quoteUpdatedEmail({ quote, statusLabel, clientUrl }) {
  const hasPrice = quote.quotedAmount !== null && quote.quotedAmount !== undefined;

  const body =
    heading(hasPrice ? "عرض السعر جاهز 🎉" : "تحديث على طلبك") +
    paragraph(`بخصوص طلبك رقم <strong style="color:${BRAND.teal};">${esc(quote.quoteNumber)}</strong> — ${esc(quote.serviceTitle || quote.service || "")}`) +
    (hasPrice
      ? `<div style="background:#e8f8f7;border:1px solid ${BRAND.teal};border-radius:14px;padding:20px;text-align:center;margin:8px 0 18px;">
           <div style="color:${BRAND.tealDark};font-size:13px;font-weight:700;">قيمة العرض</div>
           <div style="color:${BRAND.ink};font-size:30px;font-weight:800;margin-top:6px;">${esc(money(quote.quotedAmount))}</div>
         </div>`
      : `<div style="display:inline-block;background:#e8f8f7;color:${BRAND.tealDark};border-radius:999px;padding:9px 22px;font-weight:800;font-size:15px;margin-bottom:16px;">${esc(statusLabel)}</div>`) +
    (quote.quotedNote ? paragraph(`<span style="color:${BRAND.muted};">تفاصيل العرض:</span><br>${esc(quote.quotedNote)}`) : "") +
    button("عرض الطلب", `${clientUrl}/quotes`) +
    paragraph(`<span style="color:${BRAND.muted};font-size:13px;">للموافقة أو الاستفسار، رد على الرسالة دي أو كلّمنا مباشرة.</span>`);

  return build(
    hasPrice
      ? `عرض السعر ${quote.quoteNumber} — ${money(quote.quotedAmount)}`
      : `تحديث على طلبك ${quote.quoteNumber}`,
    body,
    "",
    hasPrice ? "عرض السعر بتاعك جاهز" : statusLabel,
  );
}

/** إشعار الإدارة برسالة تواصل جديدة */
export function messageReceivedAdminEmail({ message, clientUrl }) {
  const body =
    heading("✉️ رسالة تواصل جديدة") +
    infoBox([
      ["الاسم", esc(message.name)],
      ["البريد", esc(message.email)],
      ["الجوال", esc(message.phone)],
      ["الموضوع", esc(message.subject)],
      ["التاريخ", esc(dateAr(message.createdAt))],
    ]) +
    `<div style="background:#f8fafc;border-right:4px solid ${BRAND.teal};border-radius:10px;padding:16px;color:#374151;white-space:pre-wrap;">${esc(message.message)}</div>` +
    button("افتح الرسائل في اللوحة", `${clientUrl}/admin/messages`, BRAND.orange);

  return build(
    `رسالة جديدة من ${message.name}${message.subject ? ` — ${message.subject}` : ""}`,
    body,
    "",
    String(message.message || "").slice(0, 90),
  );
}

/** رد الإدارة على رسالة التواصل — للعميل */
export function messageReplyEmail({ message, replyText, clientUrl }) {
  const body =
    heading("رد على رسالتك") +
    paragraph(`أهلاً ${esc(message.name)}، ده ردنا على رسالتك${message.subject ? ` بخصوص "${esc(message.subject)}"` : ""}:`) +
    `<div style="background:#e8f8f7;border-right:4px solid ${BRAND.teal};border-radius:10px;padding:16px;color:#134e4a;white-space:pre-wrap;margin-bottom:18px;">${esc(replyText)}</div>` +
    `<div style="color:${BRAND.muted};font-size:13px;">رسالتك الأصلية:</div>` +
    `<div style="background:#f8fafc;border:1px solid ${BRAND.border};border-radius:10px;padding:14px;color:${BRAND.muted};font-size:13px;white-space:pre-wrap;margin-top:6px;">${esc(message.message)}</div>` +
    button("تواصل معنا", `${clientUrl}/contact`);

  return build("رد على رسالتك — Digital AD", body, "", String(replyText).slice(0, 90));
}

/** رابط استعادة كلمة المرور */
export function passwordResetEmail({ user, resetUrl, minutes }) {
  const body =
    heading("استعادة كلمة المرور") +
    paragraph(`أهلاً ${esc(user.name.split(" ")[0])}، وصلنا طلب لإعادة تعيين كلمة مرور حسابك في Digital AD.`) +
    paragraph("اضغط على الزرار ده عشان تختار كلمة مرور جديدة:") +
    button("تعيين كلمة مرور جديدة", resetUrl) +
    `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px;color:#9a3412;font-size:13px;margin-bottom:16px;">
       ⏱️ الرابط ده صالح لمدة <strong>${esc(minutes)} دقيقة</strong> بس، ومرة واحدة.
     </div>` +
    paragraph(`<span style="color:${BRAND.muted};font-size:13px;">لو الزرار مش شغّال، انسخ الرابط ده في المتصفّح:<br><span style="word-break:break-all;color:${BRAND.tealDark};">${esc(resetUrl)}</span></span>`) +
    paragraph(`<span style="color:${BRAND.muted};font-size:13px;">لو مش أنت اللي طلبت ده، تجاهل الرسالة — كلمة مرورك الحالية مش هتتغيّر.</span>`);

  return build("استعادة كلمة المرور — Digital AD", body, "", "رابط إعادة تعيين كلمة المرور");
}

/** تأكيد تغيير كلمة المرور */
export function passwordChangedEmail({ user, clientUrl }) {
  const body =
    heading("تم تغيير كلمة المرور") +
    paragraph(`أهلاً ${esc(user.name.split(" ")[0])}، كلمة مرور حسابك اتغيّرت بنجاح وكل الجلسات المفتوحة على الأجهزة التانية اتقفلت.`) +
    button("تسجيل الدخول", `${clientUrl}/login`) +
    `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px;color:#991b1b;font-size:13px;">
       🔒 لو مش أنت اللي عملت ده، كلّمنا فورًا.
     </div>`;

  return build("تم تغيير كلمة مرور حسابك", body, "", "كلمة المرور اتغيّرت بنجاح");
}
