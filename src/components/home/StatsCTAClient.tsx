"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";

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

export default function StatsCTAClient({ content }: { content: StatsCTAContent }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const bgColor = content.bg_color || "#FFF1F1";
    const py = content.padding_y ? `${content.padding_y}px` : "40px";
    const imgH = content.image_height ? `${content.image_height}px` : "260px";
    const labelColor = content.stat_label_color || "#1f2937";
    const strokeColor = content.stat_stroke_color || "var(--primary)";

    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = content.video_url ? getYoutubeId(content.video_url) : null;
    
    return (
        <section className="relative overflow-hidden" style={{ backgroundColor: bgColor }}>
            {/* Background Pattern (Dots) */}
            <div 
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, #a60303 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row items-center">
                    
                    {/* Stats List */}
                    <div className="w-full lg:flex-1 px-4 sm:px-6" style={{ paddingTop: py, paddingBottom: py }}>
                        <div className="grid grid-cols-3 gap-4 sm:gap-12 lg:gap-8 max-w-4xl">
                            {/* Stat 1 */}
                            <div className="text-center">
                                <div className="text-4xl sm:text-6xl lg:text-7xl font-black mb-1 sm:mb-2 opacity-100"
                                     style={{ WebkitTextStroke: `2px ${strokeColor}`, color: 'transparent' }}>
                                    {content.stat1_number}
                                </div>
                                <div className="font-bold text-sm sm:text-lg" style={{ color: labelColor }}>
                                    {content.stat1_label}
                                </div>
                            </div>

                            {/* Stat 2 */}
                            <div className="text-center">
                                <div className="text-4xl sm:text-6xl lg:text-7xl font-black mb-1 sm:mb-2 opacity-100"
                                     style={{ WebkitTextStroke: `2px ${strokeColor}`, color: 'transparent' }}>
                                    {content.stat2_number}
                                </div>
                                <div className="font-bold text-sm sm:text-lg" style={{ color: labelColor }}>
                                    {content.stat2_label}
                                </div>
                            </div>

                            {/* Stat 3 */}
                            <div className="text-center">
                                <div className="text-4xl sm:text-6xl lg:text-7xl font-black mb-1 sm:mb-2 opacity-100"
                                     style={{ WebkitTextStroke: `2px ${strokeColor}`, color: 'transparent' }}>
                                    {content.stat3_number}
                                </div>
                                <div className="font-bold text-sm sm:text-lg" style={{ color: labelColor }}>
                                    {content.stat3_label}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Area - hidden on mobile, absolute on desktop */}
                    <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 lg:w-[45%] justify-end items-center pointer-events-none" style={{ height: imgH }}>
                        <div className="relative w-full h-full p-0.5 lg:rounded-l-full overflow-hidden group pointer-events-auto">
                            <Image 
                                src={content.image_url} 
                                alt="Success Stories" 
                                fill
                                className="object-cover"
                            />
                            {/* Play Button Overlay */}
                            {content.video_url && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        {/* Pulsing Ripple */}
                                        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-150" />
                                        <button 
                                            onClick={() => setIsModalOpen(true)}
                                            className="relative w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white border-2 border-white/50 hover:scale-110 transition-transform group"
                                        >
                                            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-xl" style={{ color: strokeColor }}>
                                                <Play fill="currentColor" size={16} className="ml-0.5" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Video Modal */}
            {isModalOpen && videoId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white hover:rotate-90 transition-all p-2 bg-white/10 rounded-full"
                    >
                        <X size={32} />
                    </button>
                    
                    <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title="Video Player"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </section>
    );
}
