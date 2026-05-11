/**
 * Shared mailer utility — reused by API routes that send transactional emails
 * (OTP, welcome, notifications) without going through the public /api/mail/send route.
 */
import nodemailer from "nodemailer";
import { supabaseAdmin } from "./supabase-admin";

type MailPayload = { to: string; subject: string; html: string; replyTo?: string };

async function getSettings() {
    const { data } = await supabaseAdmin
        .from("mail_settings")
        .select("*")
        .eq("id", 1)
        .single();
    return data;
}

export async function sendMail(payload: MailPayload): Promise<void> {
    const settings = await getSettings();
    if (!settings?.smtp_host) {
        console.warn("[mailer] SMTP not configured — skipping:", payload.subject);
        return;
    }
    const transporter = nodemailer.createTransport({
        host: settings.smtp_host,
        port: Number(settings.smtp_port) || 587,
        secure: settings.smtp_encryption === "ssl",
        auth: { user: settings.smtp_user, pass: settings.smtp_password },
        ...(settings.smtp_encryption === "tls" ? { requireTLS: true } : {}),
    });
    const from = `"${settings.from_name || "First Bencher"}" <${settings.from_email || settings.smtp_user}>`;
    await transporter.sendMail({ from, replyTo: payload.replyTo, to: payload.to, subject: payload.subject, html: payload.html });
}

export async function getAdminEmail(): Promise<string | null> {
    const settings = await getSettings();
    return settings?.admin_email ?? null;
}

// ── Reusable HTML wrapper ────────────────────────────────────────────────────
export function htmlWrap(title: string, body: string) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
  <tr><td style="background:#a60303;padding:28px 32px">
    <p style="margin:0;color:#fff;font-size:22px;font-weight:900">First Bencher</p>
    <p style="margin:4px 0 0;color:#ffb3b3;font-size:13px">${title}</p>
  </td></tr>
  <tr><td style="padding:32px">${body}</td></tr>
  <tr><td style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #f0f0f0">
    <p style="margin:0;color:#999;font-size:12px">© First Bencher · This is an automated message</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
