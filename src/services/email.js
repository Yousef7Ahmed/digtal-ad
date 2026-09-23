/**
 * خدمة إرسال الإيميل.
 *
 * فلسفة الملف ده: **الإيميل ما ينفعش يوقّع طلب**.
 * لو الـ SMTP مش متظبط، أو السيرفر بتاع الإيميل وقع، أو الباكدج مش متسطّبة —
 * الطلب بيكمل عادي والخطأ بيتسجّل في الكونسول بس.
 *
 * التظبيط في .env:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=...
 *   SMTP_PASS=...            (لجيميل: App Password مش باسورد الحساب)
 *   MAIL_FROM=Digital AD <no-reply@digitalad.sa>
 *   ADMIN_NOTIFY_EMAIL=...   (إشعارات الإدارة)
 */
import { env } from "../config/env.js";

let transportPromise = null;
let warned = false;

export const isMailConfigured = () => Boolean(env.mail.host && env.mail.user);

/** بيعمل الـ transport مرة واحدة بس (lazy) */
async function getTransport() {
  if (!isMailConfigured()) return null;

  if (!transportPromise) {
    transportPromise = (async () => {
      try {
        // استيراد ديناميكي: لو الباكدج مش متسطّبة السيرفر بيفضل شغّال
        const { default: nodemailer } = await import("nodemailer");

        const transport = nodemailer.createTransport({
          host: env.mail.host,
          port: env.mail.port,
          secure: env.mail.secure,
          auth: { user: env.mail.user, pass: env.mail.pass },
        });

        await transport.verify();
        console.log(`📧 الإيميل متصل (${env.mail.host}:${env.mail.port})`);
        return transport;
      } catch (error) {
        console.error("⚠️  مش قادر أوصل لسيرفر الإيميل — الإشعارات هتتسجّل في الكونسول بس.");
        console.error(`   ${error.message}`);
        return null;
      }
    })();
  }

  return transportPromise;
}

/**
 * إرسال إيميل واحد. مش بيرمي أي استثناء أبدًا.
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
export async function sendMail({ to, subject, html, text, replyTo }) {
  if (!to) return { sent: false, reason: "no-recipient" };

  if (!isMailConfigured()) {
    if (!warned) {
      warned = true;
      console.warn(
        "⚠️  إعدادات SMTP مش موجودة في .env — الإيميلات مش هتتبعت (بس السيستم شغّال عادي).",
      );
    }
    console.log(`📭 [إيميل متخطّى] إلى: ${to} — ${subject}`);
    return { sent: false, reason: "not-configured" };
  }

  try {
    const transport = await getTransport();
    if (!transport) return { sent: false, reason: "no-transport" };

    await transport.sendMail({
      from: env.mail.from,
      to,
      subject,
      html,
      text,
      replyTo: replyTo || env.mail.replyTo || undefined,
    });

    return { sent: true };
  } catch (error) {
    console.error(`❌ فشل إرسال إيميل إلى ${to}: ${error.message}`);
    return { sent: false, reason: error.message };
  }
}

/**
 * نفس sendMail بس بيشتغل في الخلفية — مش بيأخّر الرد على العميل.
 * بنستخدمها جوه الكنترولرز.
 */
export function sendMailAsync(options) {
  // ما بنعملش await عن قصد
  Promise.resolve()
    .then(() => sendMail(options))
    .catch((error) => console.error(`❌ خطأ غير متوقع في الإيميل: ${error.message}`));
}

/** إرسال قالب جاهز (من emailTemplates.js) لمستقبِل واحد */
export function sendTemplate(to, template, extra = {}) {
  if (!to || !template) return;
  sendMailAsync({ to, ...template, ...extra });
}

/** إيميل الإدارة اللي بتوصله الإشعارات */
export const adminRecipient = () => env.mail.adminEmail || "";
