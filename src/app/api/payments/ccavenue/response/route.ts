import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ccavenueDecrypt, parseCcavenueResponse } from "@/lib/ccavenue";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

// CC Avenue POSTs the final transaction result straight from the customer's
// browser to this URL (both redirect_url and cancel_url point here). We
// decrypt it, update the matching order, then bounce the browser on to the
// portal's payment confirmation page.
export async function POST(req: NextRequest) {
    const bounceTo = (status: string, orderRef?: string) => {
        const url = new URL("/portal/payments", SITE_URL);
        url.searchParams.set("status", status);
        if (orderRef) url.searchParams.set("order", orderRef);
        return NextResponse.redirect(url, { status: 303 });
    };

    try {
        const form = await req.formData();
        const encResp = form.get("encResp")?.toString();
        if (!encResp) {
            return bounceTo("error");
        }

        const { data: credsRow } = await supabaseAdmin
            .from("pages_content")
            .select("content")
            .eq("page_name", "ccavenue_credentials")
            .maybeSingle();
        const workingKey = (credsRow?.content as { working_key?: string } | undefined)?.working_key;
        if (!workingKey) {
            return bounceTo("error");
        }

        const decrypted = ccavenueDecrypt(encResp, workingKey);
        const result = parseCcavenueResponse(decrypted);

        const orderRef = result.order_id;
        if (!orderRef) {
            return bounceTo("error");
        }

        const orderStatus = (result.order_status || "").toLowerCase();
        const status = orderStatus === "success" ? "success" : orderStatus === "aborted" ? "cancelled" : "failed";

        const { error } = await supabaseAdmin
            .from("orders")
            .update({
                status,
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
        return bounceTo("error");
    }
}
