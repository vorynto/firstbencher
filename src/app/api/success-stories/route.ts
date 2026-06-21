import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// Logged-in users only: submit a success story. Auth is verified server-side
// from the session cookie. The insert uses the service-role client so it isn't
// blocked by RLS; the row is always created unapproved and must be approved by
// an admin before it shows on the site.
export async function POST(req: NextRequest) {
    try {
        // ── Require an authenticated, active user ──
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { error: "You must be logged in to submit a success story." },
                { status: 401 }
            );
        }
        const { data: profile } = await supabaseAdmin
            .from("user_profiles")
            .select("is_active")
            .eq("id", user.id)
            .single();
        if (!profile?.is_active) {
            return NextResponse.json(
                { error: "Your account is not active." },
                { status: 403 }
            );
        }

        const body = await req.json();

        const student_name = (body.student_name || "").toString().trim();
        const message = (body.message || "").toString().trim();
        const course_name = (body.course_name || "").toString().trim();

        if (!student_name || !message || !course_name) {
            return NextResponse.json(
                { error: "Name, course and your story are required." },
                { status: 400 }
            );
        }

        const rating = Number(body.rating);

        const payload = {
            student_name,
            course_name,
            company_name: (body.company_name || "").toString().trim(),
            linkedin_url: (body.linkedin_url || "").toString().trim(),
            video_url: (body.video_url || "").toString().trim(),
            message,
            rating: Number.isFinite(rating) ? rating : 5,
            image_url: body.image_url || null,
            certificate_url: body.certificate_url || null,
            is_approved: false, // admin must approve before it appears on the site
        };

        const { error } = await supabaseAdmin.from("success_stories").insert([payload]);

        if (error) {
            console.error("Success story insert failed:", error.message);
            return NextResponse.json({ error: "Failed to submit your story." }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Success story submission error:", err);
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
}
