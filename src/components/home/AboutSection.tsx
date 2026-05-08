"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Target, Lightbulb, PlayCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { sanitize } from "@/lib/sanitize";

type AboutContent = {
    badge_text: string;
    title: string;
    description: string;
    mission_title: string;
    mission_description: string;
    vision_title: string;
    vision_description: string;
    cta_text: string;
    cta_href: string;
    exp_years: string;
    exp_label: string;
    awards_count: string;
    awards_label: string;
    image1_url: string;
    image2_url: string;
};

export default function AboutSection() {
    const [content, setContent] = useState<AboutContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/pages-content?page=home_about")
            .then((res) => res.json())
            .then((data) => {
                if (data.content) {
                    setContent(data.content);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !content) return null;

    // Helper to highlight words in title
    const renderTitle = (title: string) => {
        const parts = title.split("Innovation");
        if (parts.length === 2) {
            return (
                <>
                    {parts[0]}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a60303] to-[#F07C5A] italic">
                        Innovation
                    </span>
                    {parts[1]}
                </>
            );
        }
        return title;
    };

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    
                    {/* ════════ LEFT: IMAGE COMPOSITE ════════ */}
                    <div className="flex-1 relative">
                        {/* Dot Pattern Decoration */}
                        <div className="absolute -left-12 -top-12 w-48 h-48 opacity-10 pointer-events-none">
                            <div className="grid grid-cols-6 gap-4">
                                {[...Array(36)].map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#a60303]" />
                                ))}
                            </div>
                        </div>

                        {/* Main Image Grid/Composite */}
                        <div className="relative z-10 flex gap-6">
                            {/* Image 1 (Top-Left) */}
                            <div className="mt-12">
                                <div className="relative rounded-[32px] overflow-hidden border-8 border-white shadow-2xl w-[260px] h-[340px] lg:w-[300px] lg:h-[400px]">
                                    <Image
                                        src={content.image1_url}
                                        alt="Learning"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            {/* Image 2 (Bottom-Right) */}
                            <div className="relative">
                                <div className="rounded-[32px] overflow-hidden border-8 border-white shadow-2xl w-[260px] h-[340px] lg:w-[300px] lg:h-[400px]">
                                    <Image
                                        src={content.image2_url}
                                        alt="Students"
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Experience Badge */}
                                <div className="absolute -top-10 -right-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-4 animate-bounce-slow">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-gray-900 leading-none">{content.exp_years}</p>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{content.exp_label}</p>
                                    </div>
                                </div>

                                {/* Awards Badge */}
                                <div className="absolute -bottom-8 -left-16 bg-white p-5 rounded-2xl shadow-xl border border-gray-50 flex flex-col items-center text-center min-w-[140px]">
                                    <p className="text-3xl font-black text-[#a60303] leading-none">{content.awards_count}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{content.awards_label}</p>
                                    <div className="mt-2 flex -space-x-2">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold">👤</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Wavy Arrow Decoration */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-20 hidden lg:block">
                            <svg width="400" height="300" viewBox="0 0 400 300" fill="none" stroke="#a60303" strokeWidth="2" strokeDasharray="8 8">
                                <path d="M50,150 Q125,50 200,150 T350,150" fill="none" />
                                <path d="M340,140 L350,150 L340,160" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>

                    {/* ════════ RIGHT: TEXT CONTENT ════════ */}
                    <div className="flex-1 min-w-0">
                        {/* Section Tag */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-[#a60303] text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-sm border border-red-100/50">
                            <span className="w-2 h-2 rounded-full bg-[#a60303] animate-pulse"></span>
                            {content.badge_text}
                        </div>

                        <h2 className="text-4xl lg:text-[52px] font-black text-gray-900 leading-[1.1] mb-8 max-w-2xl">
                            {renderTitle(content.title)}
                        </h2>

                        <div 
                            className="text-gray-500 text-lg leading-relaxed mb-10 max-w-2xl prose prose-gray w-full"
                            dangerouslySetInnerHTML={{ __html: sanitize(content.description.replaceAll("&nbsp;", " ")) }}
                        />

                        {/* Mission & Vision Grid */}
                        <div className="grid sm:grid-cols-2 gap-8 mb-12 max-w-2xl">
                            <div className="bg-white p-1 rounded-2xl transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Target className="text-orange-500" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 mb-2">{content.mission_title}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed">{content.mission_description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-1 rounded-2xl transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Lightbulb className="text-yellow-500" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 mb-2">{content.vision_title}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed">{content.vision_description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-10">
                            <Button 
                                href={content.cta_href}
                                className="px-8 py-4 shadow-lg group"
                            >
                                {content.cta_text}
                                <span className="group-hover:translate-x-1 transition-transform ml-2">→</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
                    50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </section>
    );
}
