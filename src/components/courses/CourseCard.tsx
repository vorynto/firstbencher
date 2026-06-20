import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
            className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(166,3,3,0.08)] transition-all duration-300 overflow-hidden flex flex-col border border-gray-200 hover:border-[var(--primary)]/25 group h-full cursor-pointer"
        >
            {/* Header / Image Area — gradient always shown, image blended on top */}
            <div className="p-3">
                <div className={cn("w-full h-48 rounded-lg flex items-center justify-center relative overflow-hidden", bgClass)}>
                    {/* Subtle texture overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />

                    {course.image_url ? (
                        <img
                            src={course.image_url}
                            alt={course.title}
                            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : null}

                    <h3 className="text-white text-3xl font-black text-center px-4 relative z-10 drop-shadow-md group-hover:scale-105 transition-transform duration-500">
                        {displayTitle}
                    </h3>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 pt-2 flex flex-col flex-1">
                <h4 className="text-[19px] font-extrabold text-[#1a202c] leading-tight mb-8 line-clamp-2 min-h-[48px] group-hover:text-[var(--primary)] transition-colors">
                    {course.title}
                </h4>

                {/* Action Button */}
                <div className="mt-auto">
                    <div className="inline-flex items-center justify-center w-full font-bold rounded-md text-sm px-8 py-3.5 shadow-md bg-button-bg text-button-text transition-all duration-300">
                        Know More
                    </div>
                </div>
            </div>
        </Link>
    );
}
