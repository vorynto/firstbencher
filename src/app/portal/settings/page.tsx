import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import SettingsClient from "@/components/portal/SettingsClient";

export default async function PortalSettingsPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("full_name, email, phone")
        .eq("id", user!.id)
        .single();

    return (
        <SettingsClient
            fullName={profile?.full_name || ""}
            email={profile?.email || user!.email || ""}
            phone={profile?.phone || ""}
        />
    );
}
