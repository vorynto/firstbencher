"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import CourseCard, { Course } from "@/components/courses/CourseCard";
import { cn } from "@/lib/utils";
import PageHero from "@/components/ui/PageHero";

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
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialCategory ? [initialCategory] : []
    );
    const [minRating, setMinRating] = useState<number | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    // Close filter panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setIsFilterOpen(false);
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
                course.slug.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory =
                selectedCategories.length === 0 ||
                (course.category && selectedCategories.includes(course.category));
            const matchesRating =
                minRating === null || (course.rating || 5) >= minRating;
            return matchesSearch && matchesCategory && matchesRating;
        });
    }, [searchTerm, selectedCategories, minRating, initialCourses]);

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategories([]);
        setMinRating(null);
    };

    const activeFilterCount = selectedCategories.length + (minRating !== null ? 1 : 0);

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

                    {/* Search */}
                    <div className="max-w-2xl mx-auto relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search courses (e.g. PMP, Agile, AI)..."
                            className="w-full pl-14 pr-12 py-5 rounded-3xl border-2 border-gray-200 focus:border-[var(--primary)] shadow-lg shadow-red-900/5 focus:ring-4 focus:ring-[var(--primary)]/20 outline-none text-gray-700 font-medium transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
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

                    {/* Filter toggle button */}
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(prev => !prev)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-sm",
                                isFilterOpen || activeFilterCount > 0
                                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <Filter size={15} />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-white text-[var(--primary)] text-[11px] font-black flex items-center justify-center leading-none">
                                    {activeFilterCount}
                                </span>
                            )}
                            <ChevronDown
                                size={14}
                                className={cn("transition-transform duration-200", isFilterOpen ? "rotate-180" : "")}
                            />
                        </button>

                        {/* ── Filter Panel ── */}
                        {isFilterOpen && (
                            <div className="absolute right-0 top-full mt-2 z-30 bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/60 p-5 w-[min(580px,90vw)]">

                                {/* Categories */}
                                <div className="mb-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Categories</p>
                                        {selectedCategories.length > 0 && (
                                            <button
                                                onClick={() => setSelectedCategories([])}
                                                className="text-[10px] font-bold text-[var(--primary)] hover:underline"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => toggleCategory(cat)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                                    selectedCategories.includes(cat)
                                                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Min Rating */}
                                <div className="mb-5">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Minimum Rating</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {[4.5, 4, 3.5].map(rating => (
                                            <button
                                                key={rating}
                                                onClick={() => setMinRating(minRating === rating ? null : rating)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-bold transition-all",
                                                    minRating === rating
                                                        ? "bg-accent border-[var(--primary)] text-[var(--primary)]"
                                                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                                )}
                                            >
                                                <span className="text-[#feca57]">★</span> {rating}+ stars
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        Reset all
                                    </button>
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="px-5 py-2 bg-[var(--primary)] text-white text-xs font-black rounded-xl hover:bg-[#8a0202] transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active filter chips */}
                {(selectedCategories.length > 0 || minRating !== null) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {selectedCategories.map(cat => (
                            <span
                                key={cat}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold"
                            >
                                {cat}
                                <button onClick={() => toggleCategory(cat)} className="hover:text-red-800">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        {minRating !== null && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold">
                                ★ {minRating}+ stars
                                <button onClick={() => setMinRating(null)} className="hover:text-red-800">
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                        <button
                            onClick={clearFilters}
                            className="text-xs font-bold text-gray-400 hover:text-gray-700 px-2 transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* ── Course Grid ── */}
                {filteredCourses.length === 0 ? (
                    <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-5">
                            <Search size={32} className="text-[var(--primary)]/40" />
                        </div>
                        {selectedCategories.length > 0 && !searchTerm ? (
                            <>
                                <h3 className="text-xl font-black text-gray-900 mb-2">
                                    No courses found in this category
                                </h3>
                                <p className="text-gray-500 mb-8 px-4">
                                    There are currently no courses available under{" "}
                                    <span className="font-bold text-gray-800">
                                        {selectedCategories.join(", ")}
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
