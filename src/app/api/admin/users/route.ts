import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/admin/users — returns all users with profile data
export async function GET() {
    try {
        const { data: profiles, error } = await supabaseAdmin
            .from("user_profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[admin/users] fetch error:", error);
            return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
        }

        return NextResponse.json({ users: profiles || [] });
    } catch (err) {
        console.error("[admin/users] error:", err);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}

// PATCH /api/admin/users — toggle is_active for a user
export async function PATCH(req: NextRequest) {
    try {
        const { id, is_active } = await req.json();

        if (!id || typeof is_active !== "boolean") {
            return NextResponse.json({ error: "User ID and is_active flag are required." }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("user_profiles")
            .update({ is_active })
            .eq("id", id);

        if (error) {
            console.error("[admin/users] update error:", error);
            return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[admin/users] patch error:", err);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
