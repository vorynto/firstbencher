import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import PortalShell from "@/components/portal/PortalShell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login?redirect=/portal");
    }

    const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

    return (
        <PortalShell fullName={profile?.full_name || "Student"} email={profile?.email || user.email || ""}>
            {children}
        </PortalShell>
    );
}
