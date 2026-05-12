import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import HeaderClient from "./HeaderClient";

type HeaderContent = {
    email: string;
    phone: string;
    address: string;
    logo_header?: string;
    nav_links?: Array<{ name: string; href: string; hasDropdown: boolean }>;
    show_search?: boolean;
    show_cart?: boolean;
    auth_buttons_active?: boolean;
    login_text?: string;
    login_href?: string;
    register_text?: string;
    register_href?: string;
};

const defaults: HeaderContent = {
    email: "info@firstbencher.com",
    phone: "+1 (234) 567-8900",
    address: "123 Business Avenue, New York, NY 10001, USA",
    nav_links: [
        { name: "Home", href: "/", hasDropdown: false },
        { name: "About", href: "/about", hasDropdown: false },
        { name: "Courses", href: "/courses", hasDropdown: true },
        { name: "Success Stories", href: "/success-stories", hasDropdown: false },
        { name: "Contact", href: "/contact", hasDropdown: false },
    ],
    show_search: true,
    show_cart: true,
    auth_buttons_active: true,
    login_text: "Login",
    login_href: "/login",
    register_text: "Register",
    register_href: "/register",
};

/** Resolve which pages_content key to use for a given pathname */
async function resolveHeaderKey(pathname: string): Promise<string> {
    // Strip leading slash to get the slug
    const slug = pathname.replace(/^\//, "").split("/")[0];
    if (!slug) return "site_header"; // home page or root

    try {
        // Look up whether this custom page has an assigned header
        const [pagesRes, headersRes] = await Promise.all([
            supabaseAdmin.from("pages_content").select("content").eq("page_name", "system:custom_pages").single(),
            supabaseAdmin.from("pages_content").select("content").eq("page_name", "system:headers").single(),
        ]);

        const customPages: Array<{ slug: string; header_id?: string }> =
            (pagesRes.data?.content as any)?.pages || [];
        const page = customPages.find(p => p.slug === slug);

        if (!page) return "site_header"; // not a custom page → use default

        const headerId = page.header_id;
        if (!headerId || headerId === "default") return "site_header";

        // Find the page_key for this variant
        const variants: Array<{ id: string; page_key: string }> =
            (headersRes.data?.content as any)?.variants || [];
        const variant = variants.find(v => v.id === headerId);
        return variant?.page_key || "site_header";
    } catch {
        return "site_header";
    }
}

export default async function Header() {
    let content: HeaderContent = defaults;
    try {
        const headersList = await headers();
        const pathname = headersList.get("x-next-pathname") || "/";
        const headerKey = await resolveHeaderKey(pathname);

        const [headerRes, globalRes] = await Promise.all([
            supabaseAdmin.from("pages_content").select("content").eq("page_name", headerKey).single(),
            supabaseAdmin.from("pages_content").select("content").eq("page_name", "global_settings").single(),
        ]);

        if (headerRes.data?.content) {
            content = { ...defaults, ...(headerRes.data.content as Partial<HeaderContent>) };
        }
        if (globalRes.data?.content) {
            const gs = globalRes.data.content as Record<string, unknown>;
            if (typeof gs.logo_header === "string") content.logo_header = gs.logo_header;
        }
    } catch {
        // fall through to defaults
    }
    return <HeaderClient topBar={content} />;
}
