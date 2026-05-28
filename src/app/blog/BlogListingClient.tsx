"use client";

import React, { useState } from "react";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { Blog } from "@/components/home/BlogSection";

export default function BlogListingClient({ initialBlogs }: { initialBlogs: Blog[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = initialBlogs.filter(
        b =>
            b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.excerpt && b.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            {/* Search Bar */}
            <section className="-translate-y-1/2 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl flex items-center p-2 border border-gray-100">
                        <div className="flex-1 flex items-center px-4">
                            <Search className="text-gray-400 mr-3" size={20} />
                            <input
                                type="text"
                                placeholder="Search articles, trends, or guides..."
                                className="w-full py-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="p-1">
                            <Button className="rounded-2xl px-8 py-3.5">Search Now</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {filtered.map(blog => (
                            <div
                                key={blog.id}
                                className="group flex flex-col h-full bg-white rounded-[40px] border border-gray-100/80 hover:border-red-100 hover:shadow-[0_20px_60px_-15px_rgba(166,3,3,0.08)] transition-all duration-500 overflow-hidden"
                            >
                                <div className="relative h-72 overflow-hidden">
                                    {blog.image_url ? (
                                        <Image
                                            src={blog.image_url}
                                            alt={blog.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center border-b border-gray-100">
                                            <span className="text-gray-200 font-black text-6xl">ITG</span>
                                        </div>
                                    )}
                                    <div className="absolute top-6 left-6 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        {new Date(blog.published_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                </div>

                                <div className="p-8 md:p-10 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
                                            <User size={12} />
                                            {blog.author || "First Bencher"}
                                        </div>
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <Calendar size={12} />
                                            {new Date(blog.published_at).getFullYear()}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-gray-900 mb-5 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
                                        {blog.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                                        {blog.excerpt ||
                                            "Explore our latest expert analysis and deep dives into professional development strategies."}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-gray-50">
                                        <Button
                                            variant="ghost"
                                            href={`/blog/${blog.slug}`}
                                            className="group/btn p-0 h-auto hover:bg-transparent text-[var(--primary)] flex items-center justify-between w-full font-black text-xs uppercase tracking-widest"
                                        >
                                            <span className="flex items-center gap-2">
                                                Dive Deeper
                                                <ArrowRight
                                                    size={16}
                                                    className="group-hover/btn:translate-x-1 transition-transform"
                                                />
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-300" size={32} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2">No Insights Found</h2>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            We couldn&apos;t find any articles matching your search. Try different keywords.
                        </p>
                        <Button
                            variant="ghost"
                            onClick={() => setSearchTerm("")}
                            className="mt-6 text-red-600"
                        >
                            Clear search
                        </Button>
                    </div>
                )}
            </section>
        </>
    );
}
