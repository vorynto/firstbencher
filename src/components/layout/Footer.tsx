import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import FooterClient from "./FooterClient";

type FooterContent = {
    tagline: string;
    email: string;
    phone: string;
    address: string;
    facebook_url: string;
    twitter_url: string;
    linkedin_url: string;
    instagram_url: string;
    logo_footer?: string;
    show_socials?: boolean;
    copyright_text?: string;
    company_links?: Array<{ name: string; href: string }>;
    legal_links?: Array<{ name: string; href: string }>;
};

const defaults: FooterContent = {
    tagline: "Global leader in providing training and consulting solutions for Project Management, Quality Management, AI and Machine Learning.",
    email: "info@firstbencher.com",
    phone: "+1 (234) 567-890",
    address: "123 Business Avenue, Global Tech Hub, Sector 45",
    facebook_url: "#",
    twitter_url: "#",
    linkedin_url: "#",
    instagram_url: "#",
    show_socials: true,
    copyright_text: "© {year} First Bencher. All rights reserved.",
    company_links: [
        { name: "Home", href: "/" },
        { name: "About us", href: "/about" },
        { name: "Courses", href: "/courses" },
        { name: "Success Stories", href: "/success-stories" },
        { name: "Blog", href: "/blog" },
    ],
    legal_links: [
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms and Conditions", href: "/terms" },
        { name: "Refund Policy", href: "/refund-policy" },
    ],
};

/** Resolve which pages_content key to use for a given pathname */
async function resolveFooterKey(pathname: string): Promise<string> {
    const slug = pathname.replace(/^\//, "").split("/")[0];
    if (!slug) return "site_footer";

    try {
        const [pagesRes, footersRes] = await Promise.all([
            supabaseAdmin.from("pages_content").select("content").eq("page_name", "system:custom_pages").maybeSingle(),
            supabaseAdmin.from("pages_content").select("content").eq("page_name", "system:footers").maybeSingle(),
        ]);

        const customPages: Array<{ slug: string; footer_id?: string }> =
            (pagesRes.data?.content as any)?.pages || [];
        const page = customPages.find(p => p.slug === slug);

        if (!page) return "site_footer";

        const footerId = page.footer_id;
        if (!footerId || footerId === "default") return "site_footer";

        const variants: Array<{ id: string; page_key: string }> =
            (footersRes.data?.content as any)?.variants || [];
        const variant = variants.find(v => v.id === footerId);
        return variant?.page_key || "site_footer";
    } catch {
        return "site_footer";
    }
}

export default async function Footer() {
    let content: FooterContent = defaults;
    try {
        const headersList = await headers();
        const pathname = headersList.get("x-next-pathname") || "/";
        const footerKey = await resolveFooterKey(pathname);

        const [footerRes, globalRes] = await Promise.all([
            supabaseAdmin.from("pages_content").select("content").eq("page_name", footerKey).maybeSingle(),
            supabaseAdmin.from("pages_content").select("content").eq("page_name", "global_settings").maybeSingle(),
        ]);

        if (footerRes.data?.content) {
            content = { ...defaults, ...(footerRes.data.content as Partial<FooterContent>) };
        }
        if (globalRes.data?.content) {
            const gs = globalRes.data.content as Record<string, unknown>;
            if (typeof gs.logo_footer === "string") content.logo_footer = gs.logo_footer;
        }
    } catch {
        // fall through to defaults
    }
    return <FooterClient content={content} />;
}
