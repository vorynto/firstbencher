import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase";
import PageHero from "@/components/ui/PageHero";
import BlogListingClient from "./BlogListingClient";
import { Search } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

// ISR: revalidate every hour so new posts appear quickly
export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Blog & Insights | First Bencher",
    description:
        "Explore expert articles on Project Management, AI, Machine Learning, Agile, and professional development. Stay ahead with First Bencher insights.",
    alternates: { canonical: `${SITE_URL}/blog` },
    openGraph: {
        url: `${SITE_URL}/blog`,
        title: "Blog & Insights | First Bencher",
        description:
            "Expert articles on PM, AI, Agile, and professional certifications from First Bencher.",
    },
};

export default async function BlogListingPage() {
    const supabase = await createClient();
    const { data: blogs } = await supabase
        .from("blogs")
        .select("id, title, slug, excerpt, author, image_url, published_at")
        .order("published_at", { ascending: false });

    return (
        <main className="min-h-screen bg-white pb-20">
            <PageHero
                title="Latest"
                highlightedTitle="Insights & Learning Resources"
                subtitle="Stay up-to-date with the latest trends in project management, AI, quality standards, and organizational excellence."
                badgeText="Knowledge Hub"
                badgeIcon={Search}
            />
            <BlogListingClient initialBlogs={blogs || []} />
        </main>
    );
}
