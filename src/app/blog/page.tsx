import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import PageHero from "@/components/ui/PageHero";
import BlogListingClient from "./BlogListingClient";
import { Search, PenLine, ArrowRight } from "lucide-react";

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
        .eq("status", "approved")
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

            <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
                <div className="rounded-[32px] bg-primary-tint border border-[var(--primary)]/10 px-8 py-10 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[var(--primary)] shrink-0">
                            <PenLine size={22} />
                        </div>
                        <div>
                            <p className="font-black text-lg text-gray-900">Want to write for us?</p>
                            <p className="text-sm text-gray-500 mt-1">Share your expertise — submit a guest post for our editorial team to review.</p>
                        </div>
                    </div>
                    <Link
                        href="/guest-blogging"
                        className="shrink-0 inline-flex items-center gap-2 bg-[var(--primary)] text-white font-bold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-all text-sm"
                    >
                        Submit a Guest Post <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </main>
    );
}
