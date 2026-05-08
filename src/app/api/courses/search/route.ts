import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const query = req.nextUrl.searchParams.get("q") || "";
    const category = req.nextUrl.searchParams.get("cat") || "All Categories";

    if (query.length < 2 && category === "All Categories") {
        return NextResponse.json({ courses: [] });
    }

    let supabaseQuery = supabase
        .from("courses")
        .select("id, title, slug, image_url, category, short_description")
        .eq("active", true);

    if (query) {
        supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
    }

    if (category !== "All Categories") {
        supabaseQuery = supabaseQuery.eq("category", category);
    }

    const { data: courses, error } = await supabaseQuery.limit(8);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ courses: courses || [] });
}
