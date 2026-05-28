import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import CourseClientPage from "./CourseClientPage";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

type Instructor = {
    id: string;
    name: string;
    title: string;
    description: string;
    qualifications: string[];
    rating: number;
    review_count: number;
    profile_image_url: string;
};

// Module-level server client — never sent to the browser
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ISR: revalidate every hour
export const revalidate = 3600;

// Pre-build all active course slugs at build time
export async function generateStaticParams() {
    const { data } = await supabase.from("courses").select("slug").eq("active", true);
    return (data || []).map(c => ({ slug: c.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const { data: course } = await supabase
        .from("courses")
        .select("title, short_description, image_url, category, rating, review_count")
        .eq("slug", slug)
        .single();

    if (!course) return { title: "Course | First Bencher" };

    const title = `${course.title} — Online Training`;
    const description =
        course.short_description ||
        `Enroll in ${course.title} at First Bencher and earn your certification.`;
    const url = `${SITE_URL}/courses/${slug}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        keywords: [course.title, course.category, "certification", "training", "First Bencher"].filter(Boolean) as string[],
        openGraph: {
            type: "website",
            url,
            title,
            description,
            images: course.image_url
                ? [{ url: course.image_url, width: 1200, height: 630, alt: course.title }]
                : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: course.image_url ? [course.image_url] : [],
        },
    };
}

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const { data: course, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !course) {
        if (error) console.error("Error fetching course:", error.message);
        return notFound();
    }

    let instructors: Instructor[] = [];
    const instructorIds: string[] = course.instructor_ids || [];

    // Fetch instructors + sidebar content in parallel
    const [instructorResult, sidebarResult] = await Promise.all([
        instructorIds.length > 0
            ? supabase
                .from("instructors")
                .select("id,name,title,description,qualifications,rating,review_count,profile_image_url")
                .in("id", instructorIds)
                .eq("active", true)
            : Promise.resolve({ data: [] }),
        supabase
            .from("pages_content")
            .select("content")
            .eq("page_name", "course_sidebar")
            .single(),
    ]);

    if (instructorResult.data) {
        instructors = instructorIds
            .map(id => instructorResult.data!.find((i: { id: string }) => i.id === id))
            .filter(Boolean) as Instructor[];
    }

    const sidebarContent = (sidebarResult.data?.content ?? {}) as Record<string, unknown>;

    const courseUrl = `${SITE_URL}/courses/${slug}`;
    const courseJsonLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description:
            course.short_description ||
            course.description?.replace(/<[^>]+>/g, "").substring(0, 200) ||
            "",
        url: courseUrl,
        provider: {
            "@type": "Organization",
            name: "First Bencher",
            url: SITE_URL,
        },
        ...(course.image_url && { image: course.image_url }),
        ...(course.duration && { timeRequired: course.duration }),
        ...(course.category && { educationalLevel: course.category }),
        ...(course.rating && course.review_count && {
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: String(course.rating),
                reviewCount: String(course.review_count),
                bestRating: "5",
                worstRating: "1",
            },
        }),
        ...(course.price != null && {
            offers: {
                "@type": "Offer",
                price: String(course.price),
                priceCurrency: "USD",
                url: courseUrl,
                availability: "https://schema.org/InStock",
            },
        }),
    };

    return (
        <>
            <JsonLd data={courseJsonLd} />
            <CourseClientPage course={course} instructors={instructors} sidebarContent={sidebarContent} />
        </>
    );
}
