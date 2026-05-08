import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── HTML email wrapper ────────────────────────────────────────────────────────

function htmlWrap(title: string, body: string) {
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

function row(label: string, value: string) {
    if (!value) return "";
    return `<tr>
      <td style="padding:6px 0;color:#888;font-size:13px;width:140px;vertical-align:top;font-weight:600">${label}</td>
      <td style="padding:6px 0;color:#1a1a1a;font-size:13px;font-weight:500">${value}</td>
    </tr>`;
}

function section(heading: string, rows: string) {
    return `<p style="margin:20px 0 8px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:#a60303">${heading}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;padding-top:8px">${rows}</table>`;
}

// ── Email templates ───────────────────────────────────────────────────────────

function enquiryAdminMail(data: Record<string, string>, fromName: string) {
    const isEnroll = (data.source || "").toLowerCase().includes("enroll");
    const type = isEnroll ? "Enrollment" : "Enquiry";
    const body = `
        <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 4px">New ${type} Received</p>
        <p style="color:#666;font-size:13px;margin:0 0 20px">Someone submitted a ${type.toLowerCase()} via the website.</p>
        ${section("Contact Details", row("Name", data.name) + row("Email", data.email) + row("Phone", data.phone))}
        ${section("Enquiry Details", row("Source", data.source) + row("Message", data.message))}`;
    return { subject: `New ${type}: ${data.source}`, html: htmlWrap(`New ${type}`, body) };
}

function enquiryConfirmMail(data: Record<string, string>, fromName: string) {
    const isEnroll = (data.source || "").toLowerCase().includes("enroll");
    const body = `
        <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 4px">Hi ${data.name},</p>
        <p style="color:#666;font-size:13px;line-height:1.7;margin:0 0 20px">
            Thank you for ${isEnroll ? "enrolling" : "your enquiry"}! We&apos;ve received your request and our team will get back to you within 24 hours.
        </p>
        ${section("Your Submission", row("Topic", data.source) + row("Phone", data.phone) + row("Message", data.message))}
        <p style="margin:24px 0 0;color:#888;font-size:13px">If you have any urgent questions, feel free to reply to this email.</p>`;
    return {
        subject: isEnroll ? `Enrollment Confirmed — ${data.source.replace(/^Enroll Now — /i, "")}` : "We received your enquiry — First Bencher",
        html: htmlWrap("Thank you!", body),
    };
}

function contactAdminMail(data: Record<string, string>) {
    const body = `
        <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 4px">New Contact Form Submission</p>
        <p style="color:#666;font-size:13px;margin:0 0 20px">Someone submitted the contact form on the website.</p>
        ${section("Contact Details", row("Name", data.name) + row("Email", data.email) + row("Phone", data.phone))}
        ${section("Message", row("Subject", data.subject) + row("Message", data.message))}`;
    return { subject: `Contact Form: ${data.subject || data.name}`, html: htmlWrap("New Contact Submission", body) };
}

function contactConfirmMail(data: Record<string, string>) {
    const body = `
        <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 4px">Hi ${data.name},</p>
        <p style="color:#666;font-size:13px;line-height:1.7;margin:0 0 20px">
            Thank you for reaching out! We&apos;ve received your message and will respond within 1–2 business days.
        </p>
        ${section("Your Message", row("Subject", data.subject) + row("Message", data.message))}
        <p style="margin:24px 0 0;color:#888;font-size:13px">Feel free to reply to this email if you need to add anything.</p>`;
    return { subject: "We received your message — First Bencher", html: htmlWrap("Message Received", body) };
}

function jobAdminMail(data: Record<string, string>) {
    const body = `
        <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 4px">New Job Application</p>
        <p style="color:#666;font-size:13px;margin:0 0 20px">A candidate has applied for <strong>${data.job_title}</strong>.</p>
        ${section("Candidate Details", row("Name", data.name) + row("Email", data.email) + row("Phone", data.phone) + row("Location", data.address))}
        ${section("Professional Profile", row("Education", data.education) + row("Experience", data.experience) + row("Skills", data.skills))}
        ${data.resume_url ? `<p style="margin:20px 0 0"><a href="${data.resume_url}" style="background:#a60303;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px">View Resume</a></p>` : ""}`;
    return { subject: `New Application: ${data.job_title} — ${data.name}`, html: htmlWrap("New Job Application", body) };
}

function jobConfirmMail(data: Record<string, string>) {
    const body = `
        <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 4px">Hi ${data.name},</p>
        <p style="color:#666;font-size:13px;line-height:1.7;margin:0 0 20px">
            Thank you for applying for the <strong>${data.job_title}</strong> position at First Bencher! We&apos;ve received your application and our HR team will review it and reach out to you if your profile matches.
        </p>
        ${section("Application Details", row("Position", data.job_title) + row("Applied On", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })))}
        <p style="margin:24px 0 0;color:#888;font-size:13px">In the meantime, if you have any questions, feel free to reply to this email.</p>`;
    return { subject: `Application Received — ${data.job_title} | First Bencher`, html: htmlWrap("Application Received!", body) };
}

// ── Main handler ──────────────────────────────────────────────────────────────

const MAX_FIELD_LENGTH = 2000;

function validateMailPayload(type: string, data: Record<string, string>): string | null {
    const allowed = ["enquiry", "contact", "job"];
    if (!allowed.includes(type)) return "Unknown email type";
    for (const [key, val] of Object.entries(data)) {
        if (typeof val !== "string") return `Invalid field: ${key}`;
        if (val.length > MAX_FIELD_LENGTH) return `Field too long: ${key}`;
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Invalid email";
    return null;
}

export async function POST(req: NextRequest) {
    const body = await req.json() as { type: string; data: Record<string, string> };
    const { type, data } = body;

    const validationError = validateMailPayload(type, data ?? {});
    if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data: settings, error: settingsError } = await supabaseAdmin
        .from("mail_settings")
        .select("*")
        .eq("id", 1)
        .single();

    if (settingsError || !settings?.smtp_host || !settings?.admin_email) {
        return NextResponse.json({ error: "Mail not configured" }, { status: 400 });
    }

    let transporter;
    try {
        transporter = nodemailer.createTransport({
            host: settings.smtp_host,
            port: Number(settings.smtp_port) || 587,
            secure: settings.smtp_encryption === "ssl",
            auth: { user: settings.smtp_user, pass: settings.smtp_password },
            ...(settings.smtp_encryption === "tls" ? { requireTLS: true } : {}),
        });
    } catch {
        return NextResponse.json({ error: "Invalid SMTP configuration" }, { status: 500 });
    }

    const fromAddress = `"${settings.from_name || "First Bencher"}" <${settings.from_email || settings.smtp_user}>`;

    let adminMail: { subject: string; html: string };
    let userMail: { subject: string; html: string };
    let userEmail: string;

    switch (type) {
        case "enquiry":
            adminMail = enquiryAdminMail(data, settings.from_name);
            userMail = enquiryConfirmMail(data, settings.from_name);
            userEmail = data.email;
            break;
        case "contact":
            adminMail = contactAdminMail(data);
            userMail = contactConfirmMail(data);
            userEmail = data.email;
            break;
        case "job":
            adminMail = jobAdminMail(data);
            userMail = jobConfirmMail(data);
            userEmail = data.email;
            break;
        default:
            return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    try {
        await Promise.all([
            transporter.sendMail({ from: fromAddress, to: settings.admin_email, replyTo: userEmail, ...adminMail }),
            transporter.sendMail({ from: fromAddress, to: userEmail, replyTo: settings.admin_email, ...userMail }),
        ]);
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Send failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
