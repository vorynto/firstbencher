"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, X, ChevronDown, LayoutGrid, List } from "lucide-react";
import CourseCard, { Course } from "@/components/courses/CourseCard";
import { cn } from "@/lib/utils";

import PageHero from "@/components/ui/PageHero";

interface CoursesPageClientProps {
    initialCourses: Course[];
    categories: string[];
    initialCategory?: string | null;
    initialSearch?: string;
}

export default function CoursesPageClient({ initialCourses, categories, initialCategory, initialSearch = "" }: CoursesPageClientProps) {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialCategory ? [initialCategory] : []
    );
    const [minRating, setMinRating] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Filter Logic
    const filteredCourses = useMemo(() => {
        return initialCourses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 course.slug.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = selectedCategories.length === 0 || 
                                   (course.category && selectedCategories.includes(course.category));
            
            const matchesRating = minRating === null || (course.rating || 5) >= minRating;

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

    return (
        <div className="bg-gray-50/50 min-h-screen">
            {/* Hero Section */}
            <PageHero>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full text-[#a60303] text-xs font-black uppercase tracking-widest mb-6">
                        Explore Our Programs
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight text-gray-900">
                        Master New <span className="text-[#a60303]">Skills Today.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-8">
                        Choose from over 50+ professional certification courses designed to accelerate your career and help you achieve your professional goals.
                    </p>
                    
                    {/* Integrated Search for Hero */}
                    <div className="max-w-2xl mx-auto relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#a60303] transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search courses (e.g. PMP, Agile, AI)..." 
                            className="w-full pl-14 pr-12 py-5 rounded-3xl border-2 border-gray-200 focus:border-[#a60303] shadow-lg shadow-red-900/5 focus:ring-4 focus:ring-red-100 outline-none text-gray-700 font-medium transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* Sidebar Filters - Desktop */}
                    <aside className={cn(
                        "lg:w-72 shrink-0 space-y-8",
                        "fixed inset-0 z-50 bg-white p-6 lg:static lg:bg-transparent lg:p-0 transition-transform duration-300 overflow-y-auto",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    )}>
                        <div className="flex justify-between items-center lg:hidden mb-8">
                            <h2 className="text-xl font-black">Filters</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2"><X size={24} /></button>
                        </div>

                        {/* Search Filter (Mobile only since desktop has it in hero) */}
                        <div className="lg:hidden">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Search</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Course name..." 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#a60303] outline-none text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Categories Filter */}
                        <section>
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Categories</h3>
                                {(selectedCategories.length > 0) && (
                                    <button onClick={() => setSelectedCategories([])} className="text-[10px] font-bold text-[#a60303] hover:underline">Clear</button>
                                )}
                            </div>
                            <div className="flex flex-col gap-2.5">
                                {categories.map(cat => (
                                    <label key={cat} className="flex items-center gap-3 group cursor-pointer">
                                        <div className={cn(
                                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                            selectedCategories.includes(cat) ? "bg-[#a60303] border-[#a60303]" : "border-gray-200 group-hover:border-[#a60303]/50"
                                        )}>
                                            {selectedCategories.includes(cat) && <X size={12} className="text-white" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={selectedCategories.includes(cat)}
                                            onChange={() => toggleCategory(cat)}
                                        />
                                        <span className={cn(
                                            "text-sm font-semibold transition-colors",
                                            selectedCategories.includes(cat) ? "text-[#a60303]" : "text-gray-600 group-hover:text-gray-900"
                                        )}>{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* Rating Filter */}
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5">Minimal Rating</h3>
                            <div className="flex flex-col gap-3">
                                {[4.5, 4, 3.5].map(rating => (
                                    <button 
                                        key={rating}
                                        onClick={() => setMinRating(minRating === rating ? null : rating)}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-bold",
                                            minRating === rating 
                                                ? "bg-red-50 border-[#a60303] text-[#a60303] shadow-sm" 
                                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className="text-[#feca57]">★</span> {rating}+ stars
                                        </span>
                                        {minRating === rating && <div className="w-1.5 h-1.5 rounded-full bg-[#a60303]" />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <button 
                            onClick={clearFilters}
                            className="w-full py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors border-t border-gray-100 pt-6 mt-6"
                        >
                            Reset All Filters
                        </button>
                    </aside>

                    {/* Main Content Areas */}
                    <div className="flex-1 flex flex-col gap-8">
                        
                        {/* Control Bar */}
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <p className="text-sm font-bold text-gray-500">
                                Showing <span className="text-gray-900">{filteredCourses.length}</span> programs
                            </p>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold shadow-sm"
                                >
                                    <Filter size={16} /> Filters
                                </button>
                                
                                <div className="hidden sm:flex bg-gray-100 p-1 rounded-xl">
                                    <button className="p-1.5 rounded-lg bg-white shadow-sm shadow-red-900/5 text-[#a60303]"><LayoutGrid size={18} /></button>
                                    <button className="p-1.5 rounded-lg text-gray-400 hover:bg-white/50"><List size={18} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        {filteredCourses.length === 0 ? (
                            <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">No courses found</h3>
                                <p className="text-gray-500 mb-6 px-4">We couldn't find any courses matching your current filters. Try adjusting your search term or filters.</p>
                                <button onClick={clearFilters} className="text-[#a60303] font-black uppercase tracking-widest text-xs hover:underline">Clear all filters</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredCourses.map((course, idx) => (
                                    <CourseCard key={course.id} course={course} index={idx} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
