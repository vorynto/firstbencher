import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import PaymentsClient, { type OrderRow } from "@/components/portal/PaymentsClient";

export default async function PortalPaymentsPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: orders } = await supabaseAdmin
        .from("orders")
        .select("order_ref, course_title, amount, currency_code, status, payment_mode, tracking_id, failure_message, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

    const rows: OrderRow[] = (orders || []).map(o => ({
        orderRef: o.order_ref,
        courseTitle: o.course_title,
        amount: o.amount,
        currencyCode: o.currency_code,
        status: o.status,
        paymentMode: o.payment_mode,
        trackingId: o.tracking_id,
        failureMessage: o.failure_message,
        createdAt: o.created_at,
    }));

    return (
        <Suspense fallback={null}>
            <PaymentsClient orders={rows} />
        </Suspense>
    );
}
