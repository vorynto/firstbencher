import React from "react";
import { notFound } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { generateSlug } from "@/lib/utils";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import JobDetailClient from "@/components/career/JobDetailClient";
import { JsonLd } from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
    const { data } = await supabaseAdmin
        .from("jobs")
        .select("title")
        .eq("active", true);
    return (data || []).map(j => ({ slug: generateSlug(j.title) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { data: jobs } = await supabaseAdmin
        .from("jobs")
        .select("title, department, salary_range")
        .eq("active", true);
    const job = jobs?.find(j => generateSlug(j.title) === slug);

    if (!job) return { title: "Job Not Found | First Bencher" };

    const title = `${job.title}${job.department ? ` — ${job.department}` : ""} | Careers`;
    const description = `Apply for ${job.title}${job.department ? ` in ${job.department}` : ""} at First Bencher.${job.salary_range ? ` Salary: ${job.salary_range}.` : ""} Join our growing team.`;
    const url = `${SITE_URL}/career/${slug}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: { type: "website", url, title, description },
        twitter: { card: "summary", title, description },
    };
}

export default async function JobDetailPage({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: jobs } = await supabase.from("jobs").select("*").eq("active", true);
    const job = jobs?.find(j => generateSlug(j.title) === slug);
    if (!job) notFound();

    const jobJsonLd = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description:
            job.description?.replace(/<[^>]+>/g, "").substring(0, 500) ||
            `${job.title} position at First Bencher.`,
        datePosted: job.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        hiringOrganization: {
            "@type": "Organization",
            name: "First Bencher",
            url: SITE_URL,
        },
        jobLocation: {
            "@type": "Place",
            address: { "@type": "PostalAddress", addressCountry: "IN" },
        },
        employmentType: "FULL_TIME",
        ...(job.department && { occupationalCategory: job.department }),
        ...(job.salary_range && {
            baseSalary: {
                "@type": "MonetaryAmount",
                currency: "INR",
                value: {
                    "@type": "QuantitativeValue",
                    description: job.salary_range,
                },
            },
        }),
    };

    return (
        <>
            <JsonLd data={jobJsonLd} />
            <main className="min-h-screen bg-background">
                <PageHero
                    title={job.title}
                    subtitle={job.department || "Open Position at First Bencher"}
                />
                <JobDetailClient job={job} />
            </main>
        </>
    );
}
