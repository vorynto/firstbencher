import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import FeedbackForm from "./FeedbackForm";

export const metadata = {
    title: "Share Your Success Story | First Bencher",
    description: "Share your success story and inspire others who are on their learning journey with First Bencher.",
};

export default async function FeedbackPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?redirect=/feedback");
    }

    // Get the user's profile to pre-fill their name
    const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name, is_active")
        .eq("id", user.id)
        .single();

    if (!profile?.is_active) {
        redirect("/login?error=disabled");
    }

    return <FeedbackForm prefillName={profile?.full_name || ""} />;
}
