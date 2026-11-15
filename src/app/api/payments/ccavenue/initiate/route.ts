import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ccavenueEncrypt, CCAVENUE_ACTION_URL } from "@/lib/ccavenue";
import { getPriceForCountry } from "@/lib/countries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Starts a CC Avenue checkout for a course: creates a pending order row, then
// returns the encrypted request CC Avenue's hosted payment page needs. The
// working key never reaches the browser — only the resulting encRequest does.
// No account is required: a logged-out visitor can check out as a guest, and
// their student account is created automatically once the payment succeeds
// (see /api/payments/ccavenue/response).
export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        const body = await req.json();
        const courseId = (body.courseId || "").toString();
        const countryCode = (body.countryCode || "").toString().toUpperCase();
        if (!courseId || !countryCode) {
            return NextResponse.json({ error: "Missing course or country." }, { status: 400 });
        }

        let billingName: string;
        let billingEmail: string;
        let billingTel: string;
        let guestFields: { guest_full_name: string | null; guest_email: string | null; guest_phone: string | null };

        if (user) {
            const { data: profile } = await supabaseAdmin
                .from("user_profiles")
                .select("full_name, email, phone, is_active")
                .eq("id", user.id)
                .single();
            if (!profile?.is_active) {
                return NextResponse.json({ error: "Your account is not active." }, { status: 403 });
            }
            billingName = profile.full_name || "Student";
            billingEmail = profile.email || user.email || "";
            billingTel = profile.phone || "0000000000";
            guestFields = { guest_full_name: null, guest_email: null, guest_phone: null };
        } else {
            const fullName = (body.fullName || "").toString().trim();
            const email = (body.email || "").toString().trim().toLowerCase();
            const phone = (body.phone || "").toString().trim();
            if (!fullName || !email || !phone) {
                return NextResponse.json({ error: "Name, email and phone are required." }, { status: 400 });
            }
            if (!EMAIL_RE.test(email)) {
                return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
            }
            billingName = fullName;
            billingEmail = email;
            billingTel = phone;
            guestFields = { guest_full_name: fullName, guest_email: email, guest_phone: phone };
        }

        const [{ data: course }, { data: paymentSettingsRow }, { data: credsRow }] = await Promise.all([
            supabaseAdmin.from("courses").select("id, title, slug, country_prices").eq("id", courseId).maybeSingle(),
            supabaseAdmin.from("pages_content").select("content").eq("page_name", "payment_settings").maybeSingle(),
            supabaseAdmin.from("pages_content").select("content").eq("page_name", "ccavenue_credentials").maybeSingle(),
        ]);

        if (!course) {
            return NextResponse.json({ error: "Course not found." }, { status: 404 });
        }

        const paymentSettings = (paymentSettingsRow?.content || {}) as { countries?: Array<{ code: string; currency_code: string }>; ccavenue_enabled?: boolean };
        if (!paymentSettings.ccavenue_enabled) {
            return NextResponse.json({ error: "Online payment is currently disabled." }, { status: 400 });
        }

        const country = (paymentSettings.countries || []).find(c => c.code.toUpperCase() === countryCode);
        if (!country) {
            return NextResponse.json({ error: "Unsupported country." }, { status: 400 });
        }

        const amount = getPriceForCountry(course.country_prices, countryCode);
        if (amount == null) {
            return NextResponse.json({ error: "This course isn't priced for your country yet." }, { status: 400 });
        }

        const rawCreds = (credsRow?.content || {}) as { merchant_id?: string; access_code?: string; working_key?: string };
        const creds = {
            merchant_id: (rawCreds.merchant_id || "").trim(),
            access_code: (rawCreds.access_code || "").trim(),
            working_key: (rawCreds.working_key || "").trim(),
        };
        if (!creds.merchant_id || !creds.access_code || !creds.working_key) {
            return NextResponse.json({ error: "Online payment isn't configured yet. Please contact support." }, { status: 500 });
        }

        const orderRef = `FB${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const { error: insertError } = await supabaseAdmin.from("orders").insert({
            order_ref: orderRef,
            user_id: user?.id || null,
            course_id: course.id,
            course_title: course.title,
            amount,
            currency_code: country.currency_code,
            country_code: countryCode,
            status: "pending",
            ...guestFields,
        });
        if (insertError) {
            console.error("Order insert failed:", insertError.message);
            return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
        }

        const params = new URLSearchParams({
            merchant_id: creds.merchant_id,
            order_id: orderRef,
            currency: country.currency_code,
            amount: amount.toFixed(2),
            redirect_url: `${SITE_URL}/api/payments/ccavenue/response`,
            cancel_url: `${SITE_URL}/api/payments/ccavenue/response`,
            language: "EN",
            billing_name: billingName,
            billing_email: billingEmail,
            billing_tel: billingTel,
            merchant_param2: course.id,
        });

        const encRequest = ccavenueEncrypt(params.toString(), creds.working_key);

        return NextResponse.json({
            encRequest,
            accessCode: creds.access_code,
            actionUrl: CCAVENUE_ACTION_URL,
        });
    } catch (err) {
        console.error("CC Avenue initiate error:", err);
        return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
    }
}
