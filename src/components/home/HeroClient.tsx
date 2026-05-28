"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronDown, Star, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useEnquiry } from "@/components/EnquiryModal";
import { sanitize } from "@/lib/sanitize";

function slugify(str: string) {
    return str
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

type HeroContent = {
    badge: string;
    title_line1: string;
    title_line2: string;
    title_highlight: string;
    description: string;
    cta_primary_text: string;
    cta_primary_href: string;
    stat1_value: string;
    stat1_label: string;
    stat2_value: string;
    stat2_label: string;
    hero_image_url: string;
    popular_categories: string;
    student_avatar_1?: string;
    student_avatar_2?: string;
    reviewer_avatar?: string;
    clock_icon?: string;
    thumbs_up_icon?: string;
    corporate_clients?: Array<{ name: string; logo_url: string; _id?: string }>;
};

const allCategories = [
    "All Categories",
    "Project Management",
    "Program Management",
    "Quality Management",
    "Business Analysis",
    "AI & Machine Learning",
    "Supply Chain",
    "IT Programming",
    "Operations",
];

type Course = {
    id: string;
    title: string;
    category: string;
    price: number;
    slug: string;
    image_url?: string; // Added for the new search results display
    short_description?: string; // Added for the new search results display
};

async function searchCourses(query: string, category: string): Promise<Course[]> {
    await new Promise((r) => setTimeout(r, 280));
    const mock: Course[] = [
        { id: "1", title: "PMP Certification Training", category: "Project Management", price: 599, slug: "pmp-training", image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", short_description: "Master project management with PMP." },
        { id: "2", title: "AI for Business Leaders", category: "AI & Machine Learning", price: 799, slug: "ai-business", image_url: "https://images.unsplash.com/photo-1555212697-c22d5b9c7a3a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", short_description: "Understand AI's impact on business." },
        { id: "3", title: "Agile Masterclass", category: "Project Management", price: 399, slug: "agile-masterclass", image_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", short_description: "Become an Agile expert." },
        { id: "4", title: "Six Sigma Green Belt", category: "Quality Management", price: 450, slug: "six-sigma", image_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", short_description: "Improve quality with Six Sigma." },
        { id: "5", title: "Business Analysis Fundamentals", category: "Business Analysis", price: 349, slug: "ba-fundamentals", image_url: "https://images.unsplash.com/photo-1552664730-d307ca8849d1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", short_description: "Foundations of business analysis." },
        { id: "6", title: "Supply Chain Management", category: "Supply Chain", price: 499, slug: "supply-chain", image_url: "https://images.unsplash.com/photo-1589908129309-43218787091f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", short_description: "Optimize your supply chain." },
        { id: "7", title: "Python for Data Science", category: "IT Programming", price: 299, slug: "python-ds", image_url: "https://images.unsplash.com/photo-1550439062-609e1d857245?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", short_description: "Learn Python for data analysis." },
        { id: "8", title: "Program Management Professional (PgMP)", category: "Program Management", price: 899, slug: "pgmp-training", image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", short_description: "Advanced program management skills." },
        { id: "9", title: "Operations Management Fundamentals", category: "Operations", price: 329, slug: "operations-fundamentals", image_url: "https://images.unsplash.com/photo-1521737711867-ee171078176a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", short_description: "Core concepts of operations." },
    ];
    return mock.filter((c) => {
        const matchCat = category === "All Categories" || c.category === category;
        const matchQ = query === "" || c.title.toLowerCase().includes(query.toLowerCase());
        return matchCat && matchQ;
    });
}

export default function HeroClient({ content }: { content: HeroContent }) {
    const h = content;
    const { openEnquiry } = useEnquiry();
    const popularTags = h.popular_categories
        ? h.popular_categories.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [results, setResults] = useState<Course[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length < 2) {
            const t0 = setTimeout(() => { setResults([]); setShowResults(false); }, 0);
            return () => clearTimeout(t0);
        }
        const t = setTimeout(async () => {
            setLoading(true);
            const data = await searchCourses(query, category);
            setResults(data);
            setShowResults(true);
            setLoading(false);
        }, 300);
        return () => clearTimeout(t);
    }, [query, category]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false);
                setCatOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (query) params.set("search", query);
        if (category !== "All Categories") params.set("cat", category);
        window.location.href = `/courses?${params.toString()}`;
    };

    return (
        <section className="relative min-h-[500px] lg:min-h-screen flex flex-col pt-5 bg-[#F8F9FF] z-[10] overflow-x-hidden"
            style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0l20 10v20L20 40 0 30V10z\' fill=\'none\' stroke=\'%23EEF0FA\' stroke-width=\'1\' opacity=\'0.8\'/%3E%3C/svg%3E")',
            }}
        >
            {/* ── Gradient Meshes ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#fdf5f5] rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-[40%] left-[60%] w-[600px] h-[600px] bg-[#f4f6ff] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[#f6f2fe] rounded-full blur-[80px] translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="container mx-auto px-6 lg:px-12 flex-1 flex flex-col justify-center pt-2 pb-12 lg:pt-4 lg:pb-16 relative z-[20]">
                <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-6 lg:gap-6">

                    {/* ════════ LEFT CONTENT ════════ */}
                    <div className="w-full lg:flex-[1.4] text-left max-w-[700px] relative z-10 pt-0 lg:mr-auto">

                        {/* Big Headline */}
                        <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl xl:text-[72px] font-bold leading-[1.1] mb-4 lg:mb-6 text-[#1A202C] tracking-tight">
                            {h.title_line1 && <>{h.title_line1} <br /></>}
                            {h.title_line2}
                            <br />
                            <span className="text-[var(--primary)] relative inline-block mt-2 font-black">
                                {h.title_highlight}
                                <svg className="absolute -bottom-4 left-0 w-full rotate-2 opacity-80" height="15" viewBox="0 0 300 15" preserveAspectRatio="none">
                                    <path d="M0 10 Q150 -5 300 12" stroke="var(--primary)" strokeWidth="4" fill="none" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>

                        {/* Description - Adjusted width & fixed overflow */}
                        <div
                            className="text-[#64748B] text-[14px] sm:text-[15px] leading-relaxed mb-6 lg:mb-10 w-full max-w-none lg:max-w-[550px] break-words whitespace-normal prose prose-sm prose-gray"
                            dangerouslySetInnerHTML={{ __html: sanitize(h.description) }}
                        />

                        {/* CTA & Trust Row */}
                        <div className="flex flex-wrap items-center gap-8 mb-8">
                            <Button
                                onClick={() => openEnquiry("Enroll Now — Home Page")}
                                className="px-8 py-3.5 flex items-center gap-2 shrink-0"
                            >
                                <span className="text-lg leading-none">»</span>
                                {h.cta_primary_text}
                            </Button>

                            {/* Trust snippet */}
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <Image key={i} src={`https://i.pravatar.cc/36?u=trust${i}`} alt="student" width={32} height={32} className="rounded-full border-2 border-white shadow" />
                                    ))}
                                </div>
                                <div>
                                    <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />)}</div>
                                    <p className="text-xs text-gray-500">Trusted by <strong className="text-gray-800">10,000+</strong> students</p>
                                </div>
                            </div>
                        </div>

                        {/* Corporate Clients */}
                        {h.corporate_clients && h.corporate_clients.length > 0 && (
                            <div className="mt-8 lg:mt-10 overflow-hidden w-full max-w-full">
                                <h3 className="text-[13px] font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    Corporate Clients
                                    <div className="h-[1px] flex-1 bg-gray-200" />
                                </h3>
                                <div className="relative group">
                                    {/* Continuous Scroll Container */}
                                    <div className="flex items-center gap-12 animate-scroll group-hover:pause-scroll py-2">
                                        {/* Double the logos for seamless loop */}
                                        {[...h.corporate_clients, ...h.corporate_clients].map((client, idx) => (
                                            <div
                                                key={`${client._id}-${idx}`}
                                                className="flex-shrink-0 transition-all duration-300 transform hover:scale-110"
                                                title={client.name}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={client.logo_url}
                                                    alt={client.name}
                                                    className="h-7 lg:h-8 object-contain w-auto"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Fading Edges */}
                                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#F8F9FF] to-transparent z-10" />
                                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#F8F9FF] to-transparent z-10" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ════════ RIGHT — HERO IMAGE ════════ */}
                    <div className="lg:flex-[1] relative flex justify-center lg:justify-end items-end min-h-[260px] sm:min-h-[380px] lg:min-h-[500px] lg:mt-0 mt-6 w-full max-w-[500px] mx-auto lg:ml-auto pb-4">

                        {/* Decorative plus signs */}
                        <div className="absolute top-24 right-16 w-3 h-3 text-[var(--primary)] font-bold text-xl z-0">+</div>
                        <div className="absolute bottom-32 left-8 w-3 h-3 text-[var(--primary)] font-bold text-xl z-0">+</div>

                        {/* Hero image */}
                        <div className="relative z-10 w-full flex justify-center h-full items-end pb-8">
                            {h.hero_image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={h.hero_image_url}
                                    alt="Hero"
                                    className="object-contain object-bottom max-h-[650px]"
                                />
                            ) : (
                                <Image
                                    src="/hero-student.png"
                                    alt="Happy student with books"
                                    width={450}
                                    height={580}
                                    className="object-contain object-bottom"
                                    priority
                                />
                            )}
                        </div>

                        {/* Floating Card: Success Students */}
                        <div className="absolute top-16 lg:top-28 right-0 lg:-right-8 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-2.5 lg:p-3.5 flex flex-col items-center gap-1.5 min-w-[130px] lg:min-w-[150px] border border-gray-50 z-20">
                            <div className="flex -space-x-1.5 w-full justify-center relative">
                                <Image src={h.student_avatar_1 || "https://i.pravatar.cc/32?u=fc1"} alt="" width={30} height={30} className="rounded-full border-2 border-white relative z-10 aspect-square object-cover" />
                                <Image src={h.student_avatar_2 || "https://i.pravatar.cc/32?u=fc2"} alt="" width={30} height={30} className="rounded-full border-2 border-white relative z-20 aspect-square object-cover" />
                                <div className="absolute -top-1 -right-2 w-4 h-4 text-[var(--primary)]">✺</div>
                            </div>
                            <div className="text-center w-full mt-1">
                                <p className="text-[var(--primary)] font-black text-lg">{h.stat1_value}</p>
                                <p className="text-[11px] font-bold text-gray-800">{h.stat1_label}</p>
                            </div>
                        </div>


                    </div>
                </div>

                {/* ════════ COURSE SEARCH ════════ */}
                <div className="mt-4 lg:mt-2 relative z-[30] w-full flex flex-col items-center" ref={searchRef}>
                    <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-2xl sm:rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.05)] overflow-visible w-full max-w-[850px] mx-auto relative sm:px-1 sm:py-1 sm:h-[68px]">
                        {/* Category */}
                        <button
                            onClick={() => setCatOpen(!catOpen)}
                            className="flex items-center justify-between sm:w-[220px] px-5 py-4 sm:py-0 text-[13px] font-semibold text-[#64748B] hover:text-[var(--primary)] transition-colors whitespace-nowrap border-b sm:border-b-0 sm:border-r border-gray-200 rounded-t-2xl sm:rounded-none"
                        >
                            {category === "All Categories" ? "All Categories" : category}
                            <ChevronDown size={14} className={`transition-transform opacity-50 ${catOpen ? "rotate-180" : ""}`} />
                        </button>

                        <input
                            type="text"
                            placeholder="Find Your Course"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSearch()}
                            className="flex-1 px-6 py-4 sm:py-0 outline-none text-[14px] font-medium text-gray-800 placeholder-[#94A3B8] bg-transparent border-b sm:border-b-0 border-gray-200"
                        />

                        <div className="flex justify-center py-3 sm:py-0 sm:contents">
                            <Button
                                onClick={handleSearch}
                                className="px-10 py-2.5 font-bold text-[14px] rounded-xl sm:rounded-lg shrink-0 sm:ml-1 sm:h-[54px] sm:py-0 sm:my-auto sm:w-auto"
                            >
                                Search
                            </Button>
                        </div>

                        {/* Category dropdown */}
                        {catOpen && (
                            <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-64 z-50">
                                {["All Categories", "Development", "Business", "Finance", "Design", "Marketing"].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setCategory(cat); setCatOpen(false); }}
                                        className="w-full text-left px-5 py-2.5 text-sm hover:bg-[#f4f6ff] transition-colors font-medium text-gray-700"
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* AJAX results */}
                        {showResults && (
                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 max-h-80 overflow-y-auto">
                                <div className="flex items-center justify-between px-5 mb-2 pb-2 border-b border-gray-100">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Search Results</span>
                                    <button onClick={() => setShowResults(false)} className="text-gray-400 hover:text-gray-700">
                                        <X size={16} />
                                    </button>
                                </div>
                                {loading ? (
                                    <div className="px-5 py-8 text-center text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                        Searching courses...
                                    </div>
                                ) : results.length > 0 ? (
                                    <div className="flex flex-col">
                                        {results.map(course => (
                                            <Link key={course.id} href={`/courses/${course.slug}`} onClick={() => setShowResults(false)} className="px-5 py-3 hover:bg-[#f4f6ff] transition-colors flex items-center gap-4 group">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                                    {course.image_url ? (
                                                        <Image src={course.image_url} alt="" width={48} height={48} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Search size={16} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-[14px] font-bold text-gray-800 group-hover:text-[var(--primary)] line-clamp-1">{course.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{course.short_description || "Explore this course"}</p>
                                                </div>
                                            </Link>
                                        ))}
                                        <div className="px-5 pt-2 mt-1 border-t border-gray-50">
                                            <button onClick={handleSearch} className="text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-dark)] w-full text-center py-2">
                                                View all results →
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-5 py-8 text-center text-sm font-medium text-gray-500">
                                        No courses found matching &quot;{query}&quot;
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Popular Categories Row */}
                    {h.popular_categories && (
                        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                            <span className="text-[13px] font-semibold text-[#64748B] mr-1">Popular category:</span>
                            {h.popular_categories.split(',').map((cat: string, index: number) => {
                                const trimmed = cat.trim();
                                if (!trimmed) return null;
                                return (
                                    <Link
                                        key={index}
                                        href={`/courses?cat=${slugify(trimmed)}`}
                                        className="bg-white hover:bg-[var(--primary)] hover:text-white text-[#64748B] px-5 py-2 rounded-full text-[13px] font-semibold transition-colors border border-gray-200 shadow-sm"
                                    >
                                        {trimmed}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
