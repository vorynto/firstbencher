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

    const [{ data: courses, error }, { data: activeCourses }] = await Promise.all([
        supabaseQuery.limit(8),
        query
            ? supabase.from("courses").select("category").eq("active", true)
            : Promise.resolve({ data: [] as { category: string | null }[] }),
    ]);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Category matches — surfaced alongside course matches so a search for
    // "AI" also links straight to the AI & Machine Learning category, not
    // just courses whose title happens to contain the term.
    const categories = query
        ? Array.from(
              new Set(
                  (activeCourses || [])
                      .map(c => c.category)
                      .filter((c): c is string => !!c)
              )
          )
              .filter(c => c.toLowerCase().includes(query.toLowerCase()))
              .sort()
              .slice(0, 5)
        : [];

    return NextResponse.json({ courses: courses || [], categories });
}
