import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

// Server component Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BG_GRADIENTS = [
    "bg-gradient-to-br from-[#ff6b6b] to-[#ff4757]", // Red-Pink
    "bg-gradient-to-br from-[#0abde3] to-[#0984e3]", // Blue
    "bg-gradient-to-br from-[#54a0ff] to-[#2e86de]", // Darker Blue
    "bg-gradient-to-br from-[#1dd1a1] to-[#10ac84]", // Green
    "bg-gradient-to-br from-[#feca57] to-[#ff9f43]", // Yellow-Orange
    "bg-gradient-to-br from-[#9b59b6] to-[#8e44ad]", // Purple
];

type Course = {
    id: string;
    title: string;
    slug: string;
    image_url?: string;
    rating?: number;
    features?: string[];
    tags?: string[];
    card_inner_text?: string;
};

const MOCK_COURSES: Course[] = [
    {
        id: "mock1", title: "PMP® Certification Training", slug: "pmp-certification-training", rating: 5.0,
        features: ["Highly Interactive Classes", "PASS PMP® Exam in 7 Days", "Earn 35 PDU - Contact Hours"]
    },
    {
        id: "mock2", title: "Disciplined Agile Scrum Master Training + Certification", slug: "dasm-certification", rating: 5.0,
        features: ["PMI® Authorized Training", "2 Days Interactive Classes", "Earn 23 PDUs - Contact Hours"]
    },
    {
        id: "mock3", title: "CAPM® Certification Training", slug: "capm-certification-training", rating: 5.0,
        features: ["Earn 23 PDU's - Contact Hours", "COURSE Materials + Process Charts", "5 Days Class + Proper Evaluation"]
    }
];

export default async function PopularCourses() {
    // Attempt to fetch real popular courses
    let { data: courses, error } = await supabase
        .from("courses")
        .select("id, title, slug, image_url, rating, features, tags, popular_order, active, card_inner_text")
        .eq("active", true)
        .contains("tags", ["Popular"])
        .order("popular_order", { ascending: true });

    let displayCourses: Course[] = courses || [];
    
    // If no courses found with "Popular" tag, try fetching any active courses
    if (!error && displayCourses.length === 0) {
        const { data: fallbackCourses } = await supabase
            .from("courses")
            .select("id, title, slug, image_url, rating, features, tags, popular_order, active, card_inner_text")
            .eq("active", true)
            .order("popular_order", { ascending: true })
            .order("created_at", { ascending: false })
            .limit(6);
        
        if (fallbackCourses && fallbackCourses.length > 0) {
            displayCourses = fallbackCourses;
        }
    }

    if (error) {
        console.error("Failed to fetch popular courses:", error.message);
    }

    if (!displayCourses || displayCourses.length === 0) {
        displayCourses = MOCK_COURSES;
    }

    return (
        <section className="bg-accent/30 py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-[#1a202c] mb-3">Popular Courses</h2>
                    <p className="text-sm font-bold text-gray-700 tracking-wide uppercase">! New Learnings begin !</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                    {displayCourses.map((course, idx) => {
                        const bgClass = BG_GRADIENTS[idx % BG_GRADIENTS.length];
                        const displayTitle = course.card_inner_text || course.title.split(" ")[0];

                        return (
                            <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(166,3,3,0.08)] transition-all duration-300 overflow-hidden flex flex-col border border-gray-200 hover:border-[var(--primary)]/25 group cursor-pointer"
                            >
                                
                                {/* Image / Colored Header */}
                                <div className="p-3 relative">
                                    <div className={cn("w-full h-48 rounded-lg flex items-center justify-center relative overflow-hidden", bgClass)}>
                                        {/* Abstract diagonal pattern overlay */}
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
                                        
                                        {course.image_url ? (
                                            <img src={course.image_url} alt={course.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 transition-transform duration-500 group-hover:scale-110" />
                                        ) : null}
                                        
                                        <h3 className="text-white text-3xl font-black relative z-10 text-center px-4 drop-shadow-md transition-transform duration-500 group-hover:scale-110">{displayTitle}</h3>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 pt-2 flex flex-col flex-1">
                                    <h4 className="text-[19px] font-extrabold text-[#1a202c] leading-tight mb-1 line-clamp-2 min-h-[48px] group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h4>

                                    {/* Action Button */}
                                    <div className="mt-auto pt-1">
                                        <div className="inline-flex items-center justify-center w-full font-bold rounded-md text-sm px-8 py-3.5 shadow-md bg-button-bg text-button-text transition-all duration-300">
                                            Know more
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

