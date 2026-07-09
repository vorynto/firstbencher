import React from "react";
import type { Metadata } from "next";
import { PenLine } from "lucide-react";
import { buildPageMetadata } from "@/lib/page-seo";
import PageHero from "@/components/ui/PageHero";
import GuestBlogForm from "./GuestBlogForm";

export async function generateMetadata(): Promise<Metadata> {
    return buildPageMetadata("guest-blogging", {
        title: "Write for Us | Guest Blogging",
        description:
            "Share your expertise with our community. Submit a guest post on Project Management, AI, Machine Learning, or professional development — reviewed and published by our editorial team.",
        path: "/guest-blogging",
    });
}

export default function GuestBloggingPage() {
    return (
        <main className="min-h-screen bg-white pb-20">
            <PageHero
                title="Write for"
                highlightedTitle="First Bencher"
                subtitle="Share your expertise with our community of learners. Submit your article below — our editorial team reviews every submission before it goes live."
                badgeText="Guest Blogging"
                badgeIcon={PenLine}
            />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-12">
                <GuestBlogForm />
            </div>
        </main>
    );
}
