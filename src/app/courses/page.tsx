import React from "react";
import { createClient } from "@/lib/supabase";
import CoursesPageClient from "./CoursesPageClient";

export const metadata = {
    title: "All Courses | First Bencher",
    description: "Browse our comprehensive list of professional certification courses across various tech disciplines.",
};

// Revalidate every 1 hour
export const revalidate = 3600;

export default async function CoursesPage() {
    const supabase = await createClient();

    // Fetch all active courses
    const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

    // Extract unique categories for the filter
    const categories: string[] = Array.from(
        new Set(
            (courses || [])
                .map(c => c.category)
                .filter((cat): cat is string => !!cat && typeof cat === 'string')
        )
    ).sort();

    return (
        <CoursesPageClient 
            initialCourses={courses || []} 
            categories={categories} 
        />
    );
}
