import React from "react";
import { createClient } from "@/lib/supabase";
import CoursesPageClient from "./CoursesPageClient";

export const metadata = {
    title: "All Courses | First Bencher",
    description: "Browse our comprehensive list of professional certification courses across various tech disciplines.",
};

function slugify(str: string) {
    return str
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
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

    // Match URL cat param to actual category name —
    // supports both slugified ("project-management") and raw ("Project Management") values
    const matchedCategory = cat
        ? (
            categories.find(c => slugify(c) === slugify(cat)) ??
            categories.find(c => c.toLowerCase() === cat.toLowerCase()) ??
            cat  // raw param — no DB match, filter will return 0 results → empty state shown
          )
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
