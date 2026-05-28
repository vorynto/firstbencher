"use client";

import React from "react";
import Image from "next/image";
import { Calendar, User, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    author?: string;
    image_url?: string;
    published_at: string;
}

interface BlogSectionProps {
    blogs: Blog[];
}

export default function BlogSection({ blogs }: BlogSectionProps) {
    if (!blogs || blogs.length === 0) return null;

    return (
        <section className="py-20 bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest mb-4 border border-red-100/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                            Latest Updates
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                            From Our <span className="text-[var(--primary)]">Knowledge Hub</span>
                        </h2>
                    </div>
                    <div className="hidden md:block">
                        <Button variant="outline" href="/blog" className="rounded-full px-8 border-gray-200">
                            View All Posts
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-red-900/5 transition-all duration-500 flex flex-col h-full">
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden">
                                {blog.image_url ? (
                                    <Image
                                        src={blog.image_url}
                                        alt={blog.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-gray-300 font-bold text-4xl">ITG</span>
                                    </div>
                                )}
                                {/* Glass Date Badge */}
                                <div className="absolute top-6 left-6 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
                                    {new Date(blog.published_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                        <User size={14} className="text-[var(--primary)]" />
                                        {blog.author || "First Bencher"}
                                    </div>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                        <Calendar size={14} className="text-[var(--primary)]" />
                                        {new Date(blog.published_at).getFullYear()}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-tight">
                                    {blog.title}
                                </h3>

                                <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3">
                                    {blog.excerpt || "Dive deep into the latest trends and best practices in professional development and industry-certified training programs."}
                                </p>

                                <div className="mt-auto">
                                    <Button
                                        variant="ghost"
                                        href={`/blog/${blog.slug}`}
                                        className="group/btn p-0 hover:bg-transparent text-[var(--primary)] flex items-center gap-2 font-black text-xs uppercase tracking-widest"
                                    >
                                        Keep Reading
                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile View All Button */}
                <div className="md:hidden text-center">
                    <Button variant="outline" href="/blog" className="rounded-full w-full border-gray-200">
                        View All Posts
                    </Button>
                </div>
            </div>
        </section>
    );
}
