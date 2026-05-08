import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// Default content for every page-section key.
// Used as fallback when a row doesn't exist yet in the DB.
export const defaultContents: Record<string, unknown> = {
    home_hero: {
        badge: "💡 Our Online Training",
        title_line1: "Our Expert Training",
        title_line2: "Will Grow Your",
        title_highlight: "Career",
        description:
            "Convenience of online education, allowing learners to acquire new skills at their own pace and from any location. Join 10,000+ professionals worldwide.",
        cta_primary_text: "Enroll Now",
        cta_primary_href: "/courses",
        stat1_value: "2,000+",
        stat1_label: "Success Students",
        stat2_value: "405+",
        stat2_label: "Expert Courses",
        hero_image_url: "",
        popular_categories: "Accounting,Business,Development,Marketing,Meditation",
    },
    home_stats: {
        stat1_value: "10,000+",
        stat1_label: "Students Trained",
        stat1_icon: "👨‍🎓",
        stat2_value: "405+",
        stat2_label: "Expert Courses",
        stat2_icon: "📚",
        stat3_value: "98%",
        stat3_label: "Satisfaction Rate",
        stat3_icon: "⭐",
        stat4_value: "50+",
        stat4_label: "Countries Reached",
        stat4_icon: "🌍",
    },
    home_categories: {
        categories: [
            { name: "Project Management", emoji: "📋", count: 12, href: "/courses?cat=project-management" },
            { name: "Program Management", emoji: "🗂️", count: 8, href: "/courses?cat=program-management" },
            { name: "Quality Management", emoji: "✅", count: 10, href: "/courses?cat=quality-management" },
            { name: "Business Analysis", emoji: "📊", count: 9, href: "/courses?cat=business-analysis" },
            { name: "AI & Machine Learning", emoji: "🤖", count: 14, href: "/courses?cat=ai-ml" },
            { name: "Supply Chain", emoji: "🔗", count: 7, href: "/courses?cat=supply-chain" },
            { name: "IT Programming", emoji: "💻", count: 11, href: "/courses?cat=it-programming" },
            { name: "Operations", emoji: "⚙️", count: 6, href: "/courses?cat=operations" },
        ],
    },
    home_why_us: {
        headline: "Why Choose First Bencher?",
        subheadline: "We deliver world-class training that transforms careers and organizations globally.",
        features: [
            { emoji: "🏆", title: "Industry-Recognized Certifications", body: "All our courses lead to globally accepted certifications valued by top employers." },
            { emoji: "🎓", title: "Expert-Led Training", body: "Learn from certified professionals with 10+ years of real-world experience." },
            { emoji: "💻", title: "Flexible Online Learning", body: "Study at your own pace from anywhere in the world, on any device." },
            { emoji: "🤝", title: "Dedicated Support", body: "24/7 learner support and career guidance to ensure your success." },
            { emoji: "📈", title: "Proven Track Record", body: "Over 10,000+ professionals upskilled and placed in leading companies." },
            { emoji: "💰", title: "Affordable Pricing", body: "Premium training at competitive prices with flexible payment plans." },
        ],
    },
    home_stats_cta: {
        stat1_number: "10k",
        stat1_label: "Student Trained",
        stat2_number: "50+",
        stat2_label: "Recorded Courses",
        stat3_number: "15M",
        stat3_label: "Satisfaction Rate",
        image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop",
        video_url: "#",
        bg_color: "#a60303",
        padding_y: "80",
        image_height: "400"
    },
    home_about: {
        badge_text: "About Us",
        title: "Our Story: Built On Values, Driven By Innovation",
        description: "We are dedicated to transforming education through digital innovation, making learning more accessible, engaging, and effective for everyone. By integrating cutting-edge technology, we aim to create an inclusive and dynamic learning environment.",
        mission_title: "Our Mission:",
        mission_description: "To provide innovative digital education solutions that empower learners and educators, fostering a culture to growing your value.",
        vision_title: "Our Vision:",
        vision_description: "To provide innovative digital education solutions that empower learners and educators, fostering a culture to growing your value.",
        cta_text: "Know More",
        cta_href: "/about",
        exp_years: "25+",
        exp_label: "Years of experience",
        awards_count: "45+",
        awards_label: "Awards Winning",
        image1_url: "https://images.unsplash.com/photo-1523240715632-d984bc314219?q=80&w=2070&auto=format&fit=crop",
        image2_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop"
    },
    home_cta: {
        headline: "Ready to Advance Your Career?",
        subtext: "Join thousands of professionals who have transformed their careers with First Bencher.",
        button_text: "Explore Our Courses",
        button_href: "/courses",
        bg_color: "#a60303",
    },
    about_intro: {
        title: "About First Bencher",
        subtitle: "We are a global leader in providing training and consulting solutions.",
        description:
            "First Bencher is dedicated to empowering professionals worldwide with cutting-edge skills in Project Management, Quality Management, AI & Machine Learning, and more.",
        image_url: "",
        founded_year: "2015",
        students_count: "10,000+",
        courses_count: "405+",
        countries_count: "50+",
    },
    about_vision: {
        headline: "Our Vision & Mission",
        vision_title: "Vision",
        vision_text: "To be the most trusted global platform for professional development and career transformation.",
        mission_title: "Mission",
        mission_text: "To deliver world-class, affordable, and flexible training that empowers individuals and organizations to reach their full potential.",
    },
    about_values: {
        values: [
            { emoji: "🎯", title: "Excellence", body: "We pursue excellence in everything we do, from course content to learner support." },
            { emoji: "🤝", title: "Integrity", body: "We operate with transparency, honesty, and ethical standards at all times." },
            { emoji: "💡", title: "Innovation", body: "We continuously evolve our curriculum to reflect the latest industry trends." },
            { emoji: "🌍", title: "Inclusivity", body: "We believe quality education should be accessible to everyone, everywhere." },
            { emoji: "📈", title: "Impact", body: "We measure success by the real-world impact on our learners' careers." },
            { emoji: "❤️", title: "Care", body: "We genuinely care about every learner's journey and long-term success." },
        ],
    },
    about_team: {
        headline: "Meet Our Leadership",
        members: [
            { name: "John Carter", role: "CEO & Founder", image_url: "https://i.pravatar.cc/150?u=team1", bio: "20+ years in organizational learning and development." },
            { name: "Sarah Mitchell", role: "Head of Training", image_url: "https://i.pravatar.cc/150?u=team2", bio: "PMP & PRINCE2 certified trainer with global experience." },
            { name: "David Lee", role: "Chief Technology Officer", image_url: "https://i.pravatar.cc/150?u=team3", bio: "Leading our digital learning platform and innovation." },
            { name: "Priya Sharma", role: "Head of Partnerships", image_url: "https://i.pravatar.cc/150?u=team4", bio: "Building strategic alliances across 50+ countries." },
        ],
    },
    contact_header: {
        title: "Get In Touch",
        subtitle: "Have a question or want to enroll? Our team is here to help you.",
        office_hours: "Mon – Fri: 9:00 AM – 6:00 PM (GMT)",
    },
    contact_details: {
        email: "info@firstbencher.com",
        phone: "+1 (234) 567-8900",
        address: "123 Business Avenue, New York, NY 10001, USA",
        map_embed_url: "",
    },
    site_header: {
        email: "info@firstbencher.com",
        phone: "+1 (234) 567-8900",
        address: "123 Business Avenue, New York, NY 10001, USA",
        nav_links: [
            { name: "Home", href: "/", hasDropdown: true },
            { name: "About", href: "/about", hasDropdown: false },
            { name: "Courses", href: "/courses", hasDropdown: false },
            { name: "Contact", href: "/contact", hasDropdown: false },
        ],
        show_search: true,
        show_cart: true,
        auth_buttons_active: true,
        login_text: "Login",
        login_href: "/login",
        register_text: "Register",
        register_href: "/register",
    },
    site_footer: {
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
    },
    global_settings: {
        logo_header: "",
        logo_footer: "",
        primary_color: "#a60303",
        secondary_color: "#F07C5A",
        accent_color: "#f4f6ff",
        font_family: "Inter",
        header_font_family: "Inter",
        button_bg: "#a60303",
        button_text: "#ffffff",
        button_hover_bg: "#800202",
        button_hover_text: "#ffffff"
    }
};

// GET /api/pages-content?page=home_hero   → returns content object for that key
// GET /api/pages-content                  → returns all page_name rows
export async function GET(req: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const pageName = req.nextUrl.searchParams.get("page");

    if (pageName) {
        const { data, error } = await supabase
            .from("pages_content")
            .select("content")
            .eq("page_name", pageName)
            .single();

        if (error && error.code !== "PGRST116") {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        // Return DB content or fall back to defaults
        const content = data?.content ?? defaultContents[pageName] ?? {};
        return NextResponse.json({ content });
    }

    // Return all rows
    const { data, error } = await supabase
        .from("pages_content")
        .select("page_name, content, updated_at");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ rows: data });
}

// PUT /api/pages-content   body: { page_name: string, content: object }
export async function PUT(req: NextRequest) {
    const supabase = await createServerSupabaseClient();

    // Verify the caller is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: adminRow } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .single();
    if (!adminRow) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { page_name, content } = body as { page_name: string; content: unknown };

    if (!page_name || content === undefined) {
        return NextResponse.json({ error: "Missing page_name or content" }, { status: 400 });
    }

    const { error } = await supabase.from("pages_content").upsert(
        { page_name, content, updated_at: new Date().toISOString() },
        { onConflict: "page_name" }
    );

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
