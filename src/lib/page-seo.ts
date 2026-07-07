import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

// Server-only admin client — never sent to the browser. Reused across
// generateMetadata calls so admin-set SEO (from the Pages panel) is applied.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type StoredSeo = {
    seoTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    supportingKeywords?: string[];
};

type SeoFallbacks = {
    title: string;
    description: string;
    /** Absolute path (e.g. "/about") or "" for the site root. */
    path?: string;
    image?: string;
    keywords?: string[];
};

/**
 * Builds page Metadata from admin-set SEO (stored in `pages_content` under
 * `seo:<pageId>`) with sensible fallbacks. Used by the static/custom pages
 * whose SEO is editable from the admin Pages panel (home, about, contact, …).
 */
export async function buildPageMetadata(
    pageId: string,
    fallbacks: SeoFallbacks
): Promise<Metadata> {
    let seo: StoredSeo | null = null;
    try {
        const { data } = await supabaseAdmin
            .from("pages_content")
            .select("content")
            .eq("page_name", `seo:${pageId}`)
            .maybeSingle();
        seo = (data?.content as StoredSeo) || null;
    } catch {
        /* fall back to defaults */
    }

    const title = seo?.seoTitle?.trim() || fallbacks.title;
    const description = seo?.metaDescription?.trim() || fallbacks.description;
    const url = `${SITE_URL}${fallbacks.path || ""}`;

    const keywords = [
        seo?.focusKeyword,
        ...(seo?.supportingKeywords || []),
        ...(fallbacks.keywords || []),
    ].filter((k): k is string => Boolean(k && k.trim()));

    const images = fallbacks.image
        ? [{ url: fallbacks.image, width: 1200, height: 630, alt: title }]
        : [];

    return {
        title,
        description,
        alternates: { canonical: url },
        ...(keywords.length > 0 && { keywords }),
        openGraph: {
            type: "website",
            url,
            title,
            description,
            images,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: fallbacks.image ? [fallbacks.image] : [],
        },
    };
}
