import { createServerSupabaseClient } from "@/lib/supabase-server";
import StatsCTAClient from "./StatsCTAClient";

type StatsCTAContent = {
    stat1_number: string;
    stat1_label: string;
    stat2_number: string;
    stat2_label: string;
    stat3_number: string;
    stat3_label: string;
    image_url: string;
    video_url?: string;
    bg_color?: string;
    padding_y?: string;
    image_height?: string;
    stat_label_color?: string;
    stat_stroke_color?: string;
};

const defaults: StatsCTAContent = {
    stat1_number: "10k",
    stat1_label: "Student Trained",
    stat2_number: "50+",
    stat2_label: "Recorded Courses",
    stat3_number: "15M",
    stat3_label: "Satisfaction Rate",
    image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop",
    video_url: "#",
    bg_color: "var(--primary-tint)",
    padding_y: "40",
    image_height: "260",
    stat_label_color: "#1f2937",
    stat_stroke_color: "var(--primary)"
};

export default async function StatsCTA() {
    let content: StatsCTAContent = defaults;

    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase
            .from("pages_content")
            .select("content")
            .eq("page_name", "home_stats_cta")
            .single();

        if (data?.content) {
            content = { ...defaults, ...(data.content as Partial<StatsCTAContent>) };
        }
    } catch {
        // Use defaults
    }

    return <StatsCTAClient content={content} />;
}
