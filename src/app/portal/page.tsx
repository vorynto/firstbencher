import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import DashboardClient, { type RecentOrder } from "@/components/portal/DashboardClient";

export default async function PortalDashboardPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: profile }, { data: orders }, { data: stories }] = await Promise.all([
        supabaseAdmin.from("user_profiles").select("full_name").eq("id", user!.id).single(),
        supabaseAdmin
            .from("orders")
            .select("id, order_ref, course_title, amount, currency_code, status, created_at")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false }),
        supabaseAdmin.from("success_stories").select("id").eq("user_id", user!.id),
    ]);

    const allOrders = orders || [];
    const successOrders = allOrders.filter(o => o.status === "success");
    const enrolledCount = new Set(successOrders.map(o => o.course_title)).size;
    const pendingCount = allOrders.filter(o => o.status === "pending").length;
    const recent: RecentOrder[] = allOrders.slice(0, 4).map(o => ({
        orderRef: o.order_ref,
        courseTitle: o.course_title,
        amount: o.amount,
        currencyCode: o.currency_code,
        status: o.status,
        createdAt: o.created_at,
    }));

    return (
        <DashboardClient
            fullName={profile?.full_name || "Student"}
            enrolledCount={enrolledCount}
            successPaymentsCount={successOrders.length}
            pendingCount={pendingCount}
            storiesCount={stories?.length || 0}
            recentOrders={recent}
        />
    );
}
