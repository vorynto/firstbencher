import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
    try {
        const { data } = await supabaseAdmin
            .from("courses")
            .select("category")
            .eq("active", true);

        const categories: string[] = Array.from(
            new Set(
                (data || [])
                    .map((c: { category: string | null }) => c.category)
                    .filter((c): c is string => !!c)
            )
        ).sort();

        return NextResponse.json({ categories });
    } catch {
        return NextResponse.json({ categories: [] }, { status: 500 });
    }
}
