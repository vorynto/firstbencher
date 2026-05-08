import { createServerSupabaseClient } from "@/lib/supabase-server";
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

export default async function Header() {
    let content: HeaderContent = defaults;
    try {
        const supabase = await createServerSupabaseClient();
        
        // Fetch both site_header and global_settings concurrently
        const [headerRes, globalRes] = await Promise.all([
            supabase.from("pages_content").select("content").eq("page_name", "site_header").single(),
            supabase.from("pages_content").select("content").eq("page_name", "global_settings").single()
        ]);
        
        if (headerRes.data?.content) {
            content = { ...defaults, ...(headerRes.data.content as Partial<HeaderContent>) };
        }
        if (globalRes.data?.content) {
            const globalSettings = globalRes.data.content as Record<string, unknown>;
            if (typeof globalSettings.logo_header === 'string') {
                content.logo_header = globalSettings.logo_header;
            }
        }
    } catch {
        // Use defaults
    }
    return <HeaderClient topBar={content} />;
}
