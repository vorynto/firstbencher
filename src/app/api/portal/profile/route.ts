import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Logged-in users only: update their own display name / phone number. Uses
// the service-role client so it isn't blocked by RLS, but only ever touches
// the caller's own row and only the two editable fields below.
export async function PATCH(req: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const full_name = (body.full_name || "").toString().trim();
    const phone = (body.phone || "").toString().trim();

    if (!full_name) {
        return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from("user_profiles")
        .update({ full_name, phone: phone || null })
        .eq("id", user.id);

    if (error) {
        return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
