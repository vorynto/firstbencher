"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import CourseCard, { Course } from "@/components/courses/CourseCard";
import { cn } from "@/lib/utils";
import PageHero from "@/components/ui/PageHero";

const ALL_CATEGORIES = "All Categories";

interface CoursesPageClientProps {
    initialCourses: Course[];
    categories: string[];
    initialCategory?: string | null;
    initialSearch?: string;
}

export default function CoursesPageClient({
    initialCourses,
    categories,
    initialCategory,
    initialSearch = "",
}: CoursesPageClientProps) {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState<string>(
        initialCategory || ALL_CATEGORIES
    );
    const [catOpen, setCatOpen] = useState(false);
    const catRef = useRef<HTMLDivElement>(null);

    // Close category dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (catRef.current && !catRef.current.contains(e.target as Node)) {
                setCatOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter logic
    const filteredCourses = useMemo(() => {
        return initialCourses.filter(course => {
            const matchesSearch =
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (course.category ? course.category.toLowerCase().includes(searchTerm.toLowerCase()) : false);
            const matchesCategory =
                selectedCategory === ALL_CATEGORIES || course.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory, initialCourses]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory(ALL_CATEGORIES);
    };

    return (
        <div className="bg-gray-50/50 min-h-screen">
            {/* Hero Section */}
            <PageHero>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-6">
                        Explore Our Programs
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight text-gray-900">
                        Master New <span className="text-[var(--primary)]">Skills Today.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-8">
                        Choose from over 50+ professional certification courses designed to accelerate your career and help you achieve your professional goals.
                    </p>

                    {/* Search + Category Filter */}
                    <div className="max-w-2xl mx-auto relative" ref={catRef}>
                        <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-3xl sm:rounded-full border-2 border-gray-200 focus-within:border-[var(--primary)]/40 shadow-lg shadow-red-900/5 transition-colors overflow-visible">
                            {/* Category dropdown trigger */}
                            <button
                                type="button"
                                onClick={() => setCatOpen(prev => !prev)}
                                className="flex items-center justify-between gap-1.5 px-6 py-4 sm:py-0 text-sm font-bold text-gray-600 hover:text-[var(--primary)] transition-colors border-b sm:border-b-0 sm:border-r border-gray-200 whitespace-nowrap"
                            >
                                {selectedCategory}
                                <ChevronDown
                                    size={14}
                                    className={cn("transition-transform opacity-60", catOpen ? "rotate-180" : "")}
                                />
                            </button>

                            {/* Search input */}
                            <div className="relative flex-1 flex items-center group">
                                <Search className="absolute left-6 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search courses (e.g. PMP, Agile, AI)..."
                                    className="w-full pl-14 pr-12 py-5 outline-none text-gray-700 font-medium bg-transparent"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-6 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category dropdown panel */}
                        {catOpen && (
                            <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-64 max-h-72 overflow-y-auto z-30 text-left">
                                <button
                                    onClick={() => { setSelectedCategory(ALL_CATEGORIES); setCatOpen(false); }}
                                    className={cn(
                                        "w-full text-left px-5 py-2.5 text-sm hover:bg-[#f4f6ff] transition-colors font-medium",
                                        selectedCategory === ALL_CATEGORIES ? "text-[var(--primary)]" : "text-gray-700"
                                    )}
                                >
                                    {ALL_CATEGORIES}
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setSelectedCategory(cat); setCatOpen(false); }}
                                        className={cn(
                                            "w-full text-left px-5 py-2.5 text-sm hover:bg-[#f4f6ff] transition-colors font-medium",
                                            selectedCategory === cat ? "text-[var(--primary)]" : "text-gray-700"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </PageHero>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* ── Control Bar ── */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <p className="text-sm font-bold text-gray-500">
                        Showing <span className="text-gray-900">{filteredCourses.length}</span> programs
                    </p>
                </div>

                {/* Active filter chip */}
                {selectedCategory !== ALL_CATEGORIES && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold">
                            {selectedCategory}
                            <button onClick={() => setSelectedCategory(ALL_CATEGORIES)} className="hover:text-red-800">
                                <X size={12} />
                            </button>
                        </span>
                    </div>
                )}

                {/* ── Course Grid ── */}
                {filteredCourses.length === 0 ? (
                    <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-5">
                            <Search size={32} className="text-[var(--primary)]/40" />
                        </div>
                        {selectedCategory !== ALL_CATEGORIES && !searchTerm ? (
                            <>
                                <h3 className="text-xl font-black text-gray-900 mb-2">
                                    No courses found in this category
                                </h3>
                                <p className="text-gray-500 mb-8 px-4">
                                    There are currently no courses available under{" "}
                                    <span className="font-bold text-gray-800">
                                        {selectedCategory}
                                    </span>
                                    .
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[#8a0202] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md shadow-red-900/10"
                                >
                                    View All Courses
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-black text-gray-900 mb-2">No courses found</h3>
                                <p className="text-gray-500 mb-8 px-4">
                                    We couldn&apos;t find any courses matching your search. Try adjusting your filters.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[#8a0202] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md shadow-red-900/10"
                                >
                                    View All Courses
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map((course, idx) => (
                            <CourseCard key={course.id} course={course} index={idx} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
