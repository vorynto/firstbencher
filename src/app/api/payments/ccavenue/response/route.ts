import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ccavenueDecrypt, parseCcavenueResponse } from "@/lib/ccavenue";
import { sendMail, htmlWrap } from "@/lib/send-mail";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

/**
 * Finds the existing student account for a guest checkout's email, or
 * creates one. Mirrors the account shape created by the OTP signup flow
 * (an auth user + a matching user_profiles row).
 */
async function resolveOrCreateGuestAccount(email: string, fullName: string, phone: string): Promise<string | null> {
    const { data: existing } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();
    if (existing) return existing.id;

    const tempPassword = crypto.randomBytes(16).toString("hex");
    const { data: authData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName },
    });

    if (createErr || !authData?.user) {
        // Someone may have registered between our lookup and this call —
        // check once more before giving up.
        console.error("[ccavenue/response] createUser error:", createErr);
        const { data: retry } = await supabaseAdmin.from("user_profiles").select("id").eq("email", email).maybeSingle();
        return retry?.id || null;
    }

    const userId = authData.user.id;
    const { error: profileErr } = await supabaseAdmin.from("user_profiles").insert({
        id: userId,
        full_name: fullName,
        email,
        phone,
        is_active: true,
    });
    if (profileErr) {
        console.error("[ccavenue/response] profile insert error:", profileErr);
    }

    // Let the new student set their own password via Supabase's recovery
    // flow — we never send the generated temp password itself.
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: `${SITE_URL}/reset-password` },
    });
    if (linkErr) {
        console.error("[ccavenue/response] generateLink error:", linkErr);
    }
    const actionLink = linkData?.properties?.action_link;

    const body = `
        <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 4px">Welcome, ${fullName}! 🎉</p>
        <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 24px">
            Thanks for your purchase! We've created a <strong>First Bencher</strong> student account for you at
            <strong>${email}</strong> so you can track your courses and payments any time.
        </p>
        ${actionLink
            ? `<div style="text-align:center;margin:0 0 24px">
                <a href="${actionLink}" style="display:inline-block;background:#a60303;color:#fff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none">
                    Set Your Password
                </a>
               </div>`
            : `<p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 24px">
                Use the "Forgot password" link on the login page with this email address to set your password.
               </p>`
        }
        <p style="color:#999;font-size:13px">
            Once your password is set, log in any time at
            <a href="${SITE_URL}/login" style="color:#a60303">${SITE_URL.replace(/^https?:\/\//, "")}/login</a>
            to access your Student Portal.
        </p>`;

    await sendMail({
        to: email,
        subject: "Your First Bencher student account is ready",
        html: htmlWrap("Account Created", body),
    });

    return userId;
}

// CC Avenue POSTs the final transaction result straight from the customer's
// browser to this URL (both redirect_url and cancel_url point here). We
// decrypt it, update the matching order — creating the buyer's student
// account automatically on a successful guest checkout — then bounce the
// browser on to a confirmation page.
export async function POST(req: NextRequest) {
    const bounceGuestTo = (status: string, orderRef?: string) => {
        const url = new URL("/order-confirmation", SITE_URL);
        url.searchParams.set("status", status);
        if (orderRef) url.searchParams.set("order", orderRef);
        return NextResponse.redirect(url, { status: 303 });
    };
    const bouncePortalTo = (status: string, orderRef?: string) => {
        const url = new URL("/portal/payments", SITE_URL);
        url.searchParams.set("status", status);
        if (orderRef) url.searchParams.set("order", orderRef);
        return NextResponse.redirect(url, { status: 303 });
    };

    try {
        const form = await req.formData();
        const encResp = form.get("encResp")?.toString();
        if (!encResp) {
            return bounceGuestTo("error");
        }

        const { data: credsRow } = await supabaseAdmin
            .from("pages_content")
            .select("content")
            .eq("page_name", "ccavenue_credentials")
            .maybeSingle();
        const workingKey = (credsRow?.content as { working_key?: string } | undefined)?.working_key;
        if (!workingKey) {
            return bounceGuestTo("error");
        }

        const decrypted = ccavenueDecrypt(encResp, workingKey);
        const result = parseCcavenueResponse(decrypted);

        const orderRef = result.order_id;
        if (!orderRef) {
            return bounceGuestTo("error");
        }

        const { data: order } = await supabaseAdmin
            .from("orders")
            .select("user_id, guest_full_name, guest_email, guest_phone")
            .eq("order_ref", orderRef)
            .maybeSingle();
        if (!order) {
            return bounceGuestTo("error", orderRef);
        }

        const wasGuest = !order.user_id;
        const bounceTo = wasGuest ? bounceGuestTo : bouncePortalTo;

        const orderStatus = (result.order_status || "").toLowerCase();
        const status = orderStatus === "success" ? "success" : orderStatus === "aborted" ? "cancelled" : "failed";

        let linkedUserId: string | null = order.user_id;
        if (status === "success" && wasGuest && order.guest_email) {
            linkedUserId = await resolveOrCreateGuestAccount(order.guest_email, order.guest_full_name || "Student", order.guest_phone || "");
        }

        const { error } = await supabaseAdmin
            .from("orders")
            .update({
                status,
                user_id: linkedUserId,
                payment_mode: result.payment_mode || null,
                tracking_id: result.tracking_id || null,
                bank_ref_no: result.bank_ref_no || null,
                failure_message: result.failure_message || result.status_message || null,
                raw_response: result,
            })
            .eq("order_ref", orderRef);

        if (error) {
            console.error("Order update failed:", error.message);
            return bounceTo("error", orderRef);
        }

        return bounceTo(status, orderRef);
    } catch (err) {
        console.error("CC Avenue response error:", err);
        return bounceGuestTo("error");
    }
}
