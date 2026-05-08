import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateSlug } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL,                        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
        { url: `${SITE_URL}/about`,             lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        { url: `${SITE_URL}/courses`,           lastModified: now, changeFrequency: "daily",   priority: 0.9 },
        { url: `${SITE_URL}/blog`,              lastModified: now, changeFrequency: "daily",   priority: 0.8 },
        { url: `${SITE_URL}/workshops`,         lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
        { url: `${SITE_URL}/career`,            lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
        { url: `${SITE_URL}/contact`,           lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${SITE_URL}/success-stories`,   lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ];

    const [
        { data: courses },
        { data: blogs },
        { data: workshops },
        { data: jobs },
    ] = await Promise.all([
        supabase.from("courses").select("slug, created_at").eq("active", true),
        supabase.from("blogs").select("slug, published_at"),
        supabase.from("events").select("title, created_at"),
        supabase.from("jobs").select("title, created_at").eq("active", true),
    ]);

    const courseRoutes: MetadataRoute.Sitemap = (courses || []).map(c => ({
        url: `${SITE_URL}/courses/${c.slug}`,
        lastModified: new Date(c.created_at || now),
        changeFrequency: "weekly" as const,
        priority: 0.9,
    }));

    const blogRoutes: MetadataRoute.Sitemap = (blogs || []).map(b => ({
        url: `${SITE_URL}/blog/${b.slug}`,
        lastModified: new Date(b.published_at || now),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    const workshopRoutes: MetadataRoute.Sitemap = (workshops || []).map(w => ({
        url: `${SITE_URL}/workshops/${generateSlug(w.title)}`,
        lastModified: new Date(w.created_at || now),
        changeFrequency: "weekly" as const,
        priority: 0.6,
    }));

    const jobRoutes: MetadataRoute.Sitemap = (jobs || []).map(j => ({
        url: `${SITE_URL}/career/${generateSlug(j.title)}`,
        lastModified: new Date(j.created_at || now),
        changeFrequency: "weekly" as const,
        priority: 0.6,
    }));

    // Custom pages from pages_content
    let customRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: cpData } = await supabase
            .from("pages_content")
            .select("content, updated_at")
            .eq("page_name", "system:custom_pages")
            .single();
        const pages = (cpData?.content as { pages?: { slug: string }[] })?.pages || [];
        customRoutes = pages.map(p => ({
            url: `${SITE_URL}/${p.slug}`,
            lastModified: new Date(cpData?.updated_at || now),
            changeFrequency: "monthly" as const,
            priority: 0.5,
        }));
    } catch { /* no custom pages yet */ }

    return [
        ...staticRoutes,
        ...courseRoutes,
        ...blogRoutes,
        ...workshopRoutes,
        ...jobRoutes,
        ...customRoutes,
    ];
}
