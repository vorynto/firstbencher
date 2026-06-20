import { createServerSupabaseClient } from "@/lib/supabase-server";
import HeroClient from "./HeroClient";

type HeroContent = {
    badge: string;
    title_line1: string;
    title_line2: string;
    title_highlight: string;
    description: string;
    cta_primary_text: string;
    cta_primary_href: string;
    stat1_value: string;
    stat1_label: string;
    stat2_value: string;
    stat2_label: string;
    hero_image_url: string;
    popular_categories: string;
    reviewer_avatar?: string;
    clock_icon?: string;
    thumbs_up_icon?: string;
    corporate_clients?: Array<{ name: string; logo_url: string; _id?: string }>;
};

const defaults: HeroContent = {
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
    corporate_clients: [
        { name: "Mahindra", logo_url: "https://logo.clearbit.com/mahindra.com", _id: "1" },
        { name: "Ford", logo_url: "https://logo.clearbit.com/ford.com", _id: "2" },
        { name: "HCL", logo_url: "https://logo.clearbit.com/hcltech.com", _id: "3" },
        { name: "Infosys", logo_url: "https://logo.clearbit.com/infosys.com", _id: "4" },
        { name: "Amazon", logo_url: "https://logo.clearbit.com/amazon.com", _id: "5" },
        { name: "IBM", logo_url: "https://logo.clearbit.com/ibm.com", _id: "6" },
    ],
};

export default async function HeroSection() {
    let content: HeroContent = defaults;

    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase
            .from("pages_content")
            .select("content")
            .eq("page_name", "home_hero")
            .single();

        if (data?.content) {
            content = { ...defaults, ...(data.content as Partial<HeroContent>) };
        }
    } catch {
        // Use defaults on any error
    }

    return <HeroClient content={content} />;
}
