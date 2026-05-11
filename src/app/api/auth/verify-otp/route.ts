import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendMail, htmlWrap, getAdminEmail } from "@/lib/send-mail";

function hashOTP(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: NextRequest) {
    try {
        const { email, otp, password, full_name } = await req.json();

        if (!email?.trim() || !otp?.trim() || !password || !full_name?.trim()) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        // Fetch OTP record
        const { data: record, error: fetchErr } = await supabaseAdmin
            .from("otp_verifications")
            .select("*")
            .eq("email", email.toLowerCase())
            .single();

        if (fetchErr || !record) {
            return NextResponse.json({ error: "No verification request found. Please sign up again." }, { status: 400 });
        }

        // Check expiry
        if (new Date(record.expires_at) < new Date()) {
            await supabaseAdmin.from("otp_verifications").delete().eq("email", email.toLowerCase());
            return NextResponse.json({ error: "Verification code has expired. Please sign up again." }, { status: 400 });
        }

        // Verify OTP hash
        const inputHash = hashOTP(otp.trim());
        if (inputHash !== record.otp_code) {
            return NextResponse.json({ error: "Invalid verification code. Please try again." }, { status: 400 });
        }

        // Create Supabase auth user
        const { data: authData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email: email.toLowerCase(),
            password,
            email_confirm: true,
            user_metadata: { full_name: full_name.trim() },
        });

        if (createErr || !authData?.user) {
            console.error("[verify-otp] createUser error:", createErr);
            return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
        }

        const userId = authData.user.id;

        // Insert user profile
        const { error: profileErr } = await supabaseAdmin.from("user_profiles").insert({
            id: userId,
            full_name: full_name.trim(),
            email: email.toLowerCase(),
            is_active: true,
        });

        if (profileErr) {
            console.error("[verify-otp] profile insert error:", profileErr);
            // Don't fail — user was created, profile insert is supplementary
        }

        // Delete used OTP
        await supabaseAdmin.from("otp_verifications").delete().eq("email", email.toLowerCase());

        // Send welcome email
        const welcomeBody = `
            <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 4px">Welcome, ${full_name.trim()}! 🎉</p>
            <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 24px">
                Your email has been verified and your <strong>First Bencher</strong> account is now active.
                You can now log in and access all member-exclusive content including success stories and more.
            </p>
            <div style="text-align:center;margin:0 0 24px">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com"}/login"
                   style="display:inline-block;background:#a60303;color:#fff;font-size:15px;font-weight:700;
                          padding:14px 36px;border-radius:8px;text-decoration:none">
                    Log In to Your Account
                </a>
            </div>
            <p style="color:#999;font-size:13px">
                If you did not create this account, please contact us immediately at
                <a href="mailto:support@firstbencher.com" style="color:#a60303">support@firstbencher.com</a>.
            </p>`;

        await sendMail({
            to: email,
            subject: "Welcome to First Bencher — Account Verified!",
            html: htmlWrap("Welcome to First Bencher", welcomeBody),
        });

        // Send admin notification
        const adminEmail = await getAdminEmail();
        if (adminEmail) {
            const adminBody = `
                <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 4px">New User Registered</p>
                <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 16px">A new user has signed up on First Bencher.</p>
                <table style="width:100%;border-collapse:collapse;font-size:14px">
                    <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:120px;border:1px solid #eee">Name</td>
                        <td style="padding:8px 12px;border:1px solid #eee">${full_name.trim()}</td></tr>
                    <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;border:1px solid #eee">Email</td>
                        <td style="padding:8px 12px;border:1px solid #eee">${email.toLowerCase()}</td></tr>
                    <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;border:1px solid #eee">Registered</td>
                        <td style="padding:8px 12px;border:1px solid #eee">${new Date().toUTCString()}</td></tr>
                </table>
                <div style="text-align:center;margin:24px 0 0">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com"}/admin/users"
                       style="display:inline-block;background:#a60303;color:#fff;font-size:14px;font-weight:700;
                              padding:12px 28px;border-radius:8px;text-decoration:none">
                        View Users Dashboard
                    </a>
                </div>`;
            await sendMail({
                to: adminEmail,
                subject: `New signup: ${full_name.trim()} (${email.toLowerCase()})`,
                html: htmlWrap("New User Signup", adminBody),
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[verify-otp] error:", err);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
