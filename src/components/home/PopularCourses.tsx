import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
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
        <section className="bg-red-50/30 py-14">
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
                                className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 group cursor-pointer"
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
                                    <h4 className="text-[17px] font-extrabold text-[#1a202c] leading-tight mb-2 line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h4>
                                    
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={cn("w-4 h-4", i < Math.floor(course.rating || 5) ? "text-[#feca57]" : "text-gray-200")} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>

                                    {/* Features List */}
                                    <div className="flex flex-col gap-3 mb-8 flex-1">
                                        {(course.features || []).slice(0, 3).map((feat, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Check className="text-red-600 shrink-0 mt-0.5" size={16} strokeWidth={3} />
                                                <span className="text-sm font-medium text-gray-700 leading-snug">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <Button 
                                        className="w-full rounded-md shadow-md pointer-events-none"
                                    >
                                        Know more
                                    </Button>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

