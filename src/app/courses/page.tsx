import React from "react";
import { createClient } from "@/lib/supabase";
import CoursesPageClient from "./CoursesPageClient";

export const metadata = {
    title: "All Courses | First Bencher",
    description: "Browse our comprehensive list of professional certification courses across various tech disciplines.",
};

function slugify(str: string) {
    return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default async function CoursesPage({
    searchParams,
}: {
    searchParams: Promise<{ cat?: string; search?: string }>;
}) {
    const { cat, search } = await searchParams;

    const supabase = await createClient();

    const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

    const categories: string[] = Array.from(
        new Set(
            (courses || [])
                .map(c => c.category)
                .filter((c): c is string => !!c && typeof c === "string")
        )
    ).sort();

    // Match URL slug to actual category name (e.g. "project-management" → "Project Management")
    const matchedCategory = cat
        ? (categories.find(c => slugify(c) === cat) ?? null)
        : null;

    return (
        <CoursesPageClient
            initialCourses={courses || []}
            categories={categories}
            initialCategory={matchedCategory}
            initialSearch={search || ""}
        />
    );
}
