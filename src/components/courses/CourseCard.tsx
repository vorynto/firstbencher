import React from "react";
import Link from "next/link";
import { Check, Clock, Tag, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

export type Course = {
    id: string;
    title: string;
    slug: string;
    image_url?: string;
    rating?: number;
    features?: string[];
    tags?: string[];
    category?: string;
    duration?: string;
    price?: number;
    card_inner_text?: string;
};

const BG_GRADIENTS = [
    "bg-gradient-to-br from-[#ff6b6b] to-[#ff4757]",
    "bg-gradient-to-br from-[#0abde3] to-[#0984e3]",
    "bg-gradient-to-br from-[#54a0ff] to-[#2e86de]",
    "bg-gradient-to-br from-[#1dd1a1] to-[#10ac84]",
    "bg-gradient-to-br from-[#feca57] to-[#ff9f43]",
    "bg-gradient-to-br from-[#9b59b6] to-[#8e44ad]",
];

interface CourseCardProps {
    course: Course;
    index: number;
}

export default function CourseCard({ course, index }: CourseCardProps) {
    const bgClass = BG_GRADIENTS[index % BG_GRADIENTS.length];
    const displayTitle = course.card_inner_text || course.title.split(" ")[0];

    return (
        <Link 
            href={`/courses/${course.slug}`}
            className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 group h-full cursor-pointer"
        >
            
            {/* Header / Image Area */}
            <div className="p-3 relative">
                <div className="w-full h-48 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {course.image_url ? (
                        <img 
                            src={course.image_url} 
                            alt={course.title} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                    ) : (
                        <div className={cn("w-full h-full flex items-center justify-center", bgClass)}>
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
                            <h3 className="text-white text-3xl font-black text-center px-4 relative z-10">
                                {displayTitle}
                            </h3>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Content Area */}
            <div className="p-6 pt-2 flex flex-col flex-1">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} className={cn("w-4 h-4", i < Math.floor(course.rating || 5) ? "text-[#feca57]" : "text-gray-200")} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>

                <h4 className="text-[17px] font-extrabold text-[#1a202c] leading-tight mb-8 line-clamp-2 min-h-[40px] group-hover:text-[#a60303] transition-colors">
                    {course.title}
                </h4>

                {/* Action Button */}
                <div className="mt-auto">
                    <Button 
                        className="w-full rounded-md shadow-md pointer-events-none"
                    >
                        Know More
                    </Button>
                </div>
            </div>
        </Link>
    );
}
