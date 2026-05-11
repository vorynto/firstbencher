import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendMail, htmlWrap } from "@/lib/send-mail";

function generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
}

function hashOTP(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email?.trim()) {
            return NextResponse.json({ error: "Email is required." }, { status: 400 });
        }

        // Check that a pending verification exists
        const { data: record } = await supabaseAdmin
            .from("otp_verifications")
            .select("full_name")
            .eq("email", email.toLowerCase())
            .single();

        if (!record) {
            return NextResponse.json({ error: "No pending verification found. Please sign up again." }, { status: 400 });
        }

        const full_name = record.full_name || "there";

        // Generate new OTP
        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Replace existing OTP
        await supabaseAdmin.from("otp_verifications").delete().eq("email", email.toLowerCase());
        const { error: insertErr } = await supabaseAdmin.from("otp_verifications").insert({
            email: email.toLowerCase(),
            full_name,
            otp_code: otpHash,
            expires_at: expiresAt.toISOString(),
        });

        if (insertErr) {
            console.error("[resend-otp] insert error:", insertErr);
            return NextResponse.json({ error: "Could not resend code. Please try again." }, { status: 500 });
        }

        // Send OTP email
        const body = `
            <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 4px">Hi ${full_name},</p>
            <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 24px">
                You requested a new verification code. Use the code below to verify your email address.
            </p>
            <div style="background:#fff5f5;border:2px dashed #a60303;border-radius:16px;padding:24px;text-align:center;margin:0 0 24px">
                <p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em">Your new verification code</p>
                <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:12px;color:#a60303">${otp}</p>
                <p style="margin:8px 0 0;color:#888;font-size:12px">Expires in 10 minutes</p>
            </div>
            <p style="color:#999;font-size:13px">If you did not request this, you can safely ignore this email.</p>`;

        await sendMail({
            to: email,
            subject: `${otp} is your new First Bencher verification code`,
            html: htmlWrap("Email Verification", body),
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[resend-otp] error:", err);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
