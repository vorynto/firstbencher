import { createServerSupabaseClient } from "@/lib/supabase-server";
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

export default async function Footer() {
    let content: FooterContent = defaults;
    try {
        const supabase = await createServerSupabaseClient();
        
        // Fetch both site_footer and global_settings concurrently
        const [footerRes, globalRes] = await Promise.all([
            supabase.from("pages_content").select("content").eq("page_name", "site_footer").single(),
            supabase.from("pages_content").select("content").eq("page_name", "global_settings").single()
        ]);
        
        if (footerRes.data?.content) {
            content = { ...defaults, ...(footerRes.data.content as Partial<FooterContent>) };
        }
        if (globalRes.data?.content) {
            const globalSettings = globalRes.data.content as Record<string, unknown>;
            if (typeof globalSettings.logo_footer === 'string') {
                content.logo_footer = globalSettings.logo_footer;
            }
        }
    } catch {
        // Use defaults
    }
    return <FooterClient content={content} />;
}
