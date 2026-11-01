import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import SuccessStoriesPortalClient from "@/components/portal/SuccessStoriesPortalClient";

export default async function PortalSuccessStoriesPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: profile }, { data: orders }] = await Promise.all([
        supabaseAdmin.from("user_profiles").select("full_name").eq("id", user!.id).single(),
        supabaseAdmin
            .from("orders")
            .select("course_title")
            .eq("user_id", user!.id)
            .eq("status", "success"),
    ]);

    const purchasedCourseTitles = Array.from(new Set((orders || []).map(o => o.course_title))).sort();

    return (
        <SuccessStoriesPortalClient
            fullName={profile?.full_name || ""}
            courses={purchasedCourseTitles}
        />
    );
}
