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
        const { full_name, email, password } = await req.json();

        // Validate inputs
        if (!full_name?.trim() || !email?.trim() || !password) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
        }

        // Check if email already registered
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const alreadyExists = existingUsers?.users?.some(u => u.email === email.toLowerCase());
        if (alreadyExists) {
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
        }

        // Generate and hash OTP
        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Upsert into otp_verifications (replace any existing OTP for this email)
        await supabaseAdmin.from("otp_verifications").delete().eq("email", email.toLowerCase());
        const { error: insertErr } = await supabaseAdmin.from("otp_verifications").insert({
            email: email.toLowerCase(),
            full_name: full_name.trim(),
            otp_code: otpHash,
            expires_at: expiresAt.toISOString(),
        });
        if (insertErr) {
            console.error("[signup] OTP insert error:", insertErr);
            return NextResponse.json({ error: "Could not initiate verification. Please try again." }, { status: 500 });
        }

        // Send OTP email
        const body = `
            <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 4px">Hi ${full_name.trim()},</p>
            <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 24px">
                Thanks for signing up at <strong>First Bencher</strong>! Please use the verification code below to confirm your email address.
            </p>
            <div style="background:#fff5f5;border:2px dashed #a60303;border-radius:16px;padding:24px;text-align:center;margin:0 0 24px">
                <p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em">Your verification code</p>
                <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:12px;color:#a60303">${otp}</p>
                <p style="margin:8px 0 0;color:#888;font-size:12px">Expires in 10 minutes</p>
            </div>
            <p style="color:#999;font-size:13px">If you did not create an account, you can safely ignore this email.</p>`;

        await sendMail({
            to: email,
            subject: `${otp} is your First Bencher verification code`,
            html: htmlWrap("Email Verification", body),
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[signup] error:", err);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
