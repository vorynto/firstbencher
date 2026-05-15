"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquareQuote } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface SuccessStory {
    id: string;
    student_name: string;
    course_name: string;
    company_name?: string;
    rating: number;
    message: string;
    image_url?: string;
}

export default function SuccessStoriesSlider({ stories }: { stories: SuccessStory[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const handleNext = React.useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, [stories.length]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
    };

    // Auto-play
    React.useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            handleNext();
        }, 5000); // Auto-play every 5 seconds

        return () => clearInterval(interval);
    }, [isPaused, handleNext]);

    if (!stories || stories.length === 0) {
        return null;
    }

    return (
        <section className="py-12 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-2">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-1 tracking-tight">
                        Real People. <span className="text-[#a60303]">Real Success.</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                        Hear from our students who have transformed their careers and achieved their dreams through our professional training programs.
                    </p>
                </div>

                <div
                    className="relative h-[420px] sm:h-[440px] w-full max-w-[1200px] mx-auto flex items-center justify-center overflow-hidden"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <AnimatePresence initial={false}>
                        {[-2, -1, 0, 1, 2].map((offset) => {
                            const index = (currentIndex + offset + stories.length) % stories.length;
                            const story = stories[index];
                            if (!story) return null;

                            return (
                                <motion.div
                                    key={story.id + offset}
                                    initial={{ opacity: 0, scale: 0.8, x: offset * 350, rotateY: offset * 45 }}
                                    animate={{
                                        opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.3,
                                        scale: 1 - Math.abs(offset) * 0.15,
                                        x: offset * 320,
                                        zIndex: 10 - Math.abs(offset),
                                        rotateY: offset * 35,
                                        filter: offset === 0 ? "blur(0px)" : "blur(2px)"
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="absolute w-[calc(100vw-2rem)] sm:w-full sm:max-w-[550px] cursor-pointer"
                                    onClick={() => offset !== 0 && setCurrentIndex(index)}
                                >
                                    <div className={`bg-white rounded-[32px] px-8 py-6 md:px-10 md:py-8 shadow-2xl border border-gray-100 flex flex-col gap-5 relative transition-all duration-300 ${offset === 0 ? " ring-4 ring-red-500/10" : "scale-95 grayscale-[0.5]"}`}>
                                        {/* Quote icon */}
                                        <div className="absolute top-6 right-8 text-red-500/10">
                                            <Quote size={80} fill="currentColor" />
                                        </div>

                                        {/* Profile */}
                                        <div className="flex items-center gap-5 relative">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shadow-lg ring-4 ring-white shrink-0">
                                                {story.image_url ? (
                                                    <Image src={story.image_url} alt={story.student_name} width={64} height={64} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-[#a60303] to-[#c60404] flex items-center justify-center text-white font-bold text-2xl uppercase">
                                                        {story.student_name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xl font-black text-gray-900 truncate leading-tight">{story.student_name}</h4>
                                                <p className="text-[#a60303] font-bold text-sm tracking-wide uppercase mt-0.5 truncate">{story.course_name}</p>
                                                {story.company_name && <p className="text-gray-400 text-xs font-semibold mt-1 truncate">{story.company_name}</p>}
                                            </div>
                                        </div>

                                        {/* Star rating */}
                                        <div className="flex gap-1 text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={18} className={i < story.rating ? "fill-current" : "text-gray-200"} />
                                            ))}
                                        </div>

                                        {/* Review text */}
                                        <div className="relative">
                                            <p className="text-gray-700 text-lg leading-relaxed line-clamp-4 font-medium">
                                                "{story.message}"
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="absolute inset-x-0 bottom-0 flex justify-center items-center gap-6 pb-4 sm:pb-0 sm:bottom-auto sm:justify-between sm:w-full sm:max-w-[1300px]">
                         <button 
                            onClick={handlePrev}
                            className="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#a60303] hover:border-[#a60303]/30 hover:scale-110 transition-all shadow-xl hover:shadow-[#a60303]/10 z-20 group"
                        >
                            <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <button 
                            onClick={handleNext}
                            className="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#a60303] hover:border-[#a60303]/30 hover:scale-110 transition-all shadow-xl hover:shadow-[#a60303]/10 z-20 group"
                        >
                            <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="mt-2 text-center">
                    <Button 
                        href="/success-stories" 
                        className="px-10 py-4 uppercase tracking-widest group"
                    >
                        View Wall of Fame <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform ml-2" />
                    </Button>
                </div>
            </div>
            
            <style jsx global>{`
                .line-clamp-4 {
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </section>
    );
}
