"use client";

import React, { useState } from "react";
import { MapPin, Briefcase, Search, ChevronRight } from "lucide-react";
import { generateSlug } from "@/lib/utils";
import JobApplyModal from "./JobApplyModal";

type Job = {
    id: string;
    title: string;
    location: string | null;
    type: string | null;
    description: string | null;
    requirements: string | null;
    active: boolean;
    department: string | null;
    salary_range: string | null;
    salary_icon: string | null;
    created_at: string;
};

const TYPE_COLORS: Record<string, string> = {
    "Full-time": "bg-green-100 text-green-700",
    "Part-time": "bg-blue-100 text-blue-700",
    "Contract": "bg-purple-100 text-purple-700",
    "Remote": "bg-orange-100 text-orange-700",
    "Internship": "bg-yellow-100 text-yellow-700",
};

export default function CareerClient({ jobs }: { jobs: Job[] }) {
    const [applyJob, setApplyJob] = useState<Job | null>(null);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");

    const types = ["All", ...Array.from(new Set(jobs.map(j => j.type).filter(Boolean))) as string[]];

    const filtered = jobs.filter(j => {
        const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || (j.location || "").toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === "All" || j.type === filterType;
        return matchSearch && matchType;
    });

    return (
        <>
            {/* Title row + search inline */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">Open Positions</h2>
                    <p className="text-gray-500 text-sm mt-1">{jobs.length} position{jobs.length !== 1 ? "s" : ""} currently open</p>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search jobs by title or location…"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#a60303] focus:ring-2 focus:ring-red-100 transition-all"
                    />
                </div>
            </div>

            {/* Type filter buttons */}
            <div className="flex gap-2 flex-wrap mb-8">
                {types.map(t => (
                    <button
                        key={t}
                        onClick={() => setFilterType(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filterType === t ? "bg-[#a60303] text-white border-[#a60303]" : "bg-white text-gray-600 border-gray-200 hover:border-[#a60303] hover:text-[#a60303]"}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Job grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-500">No openings match your search.</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting the filters or check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(job => (
                        <div key={job.id} className="group bg-white border border-gray-200 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:border-[#a60303]/30 transition-all flex flex-col gap-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#a60303]/8 flex items-center justify-center shrink-0">
                                    <Briefcase size={22} className="text-[#a60303]" />
                                </div>
                                {job.type && (
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${TYPE_COLORS[job.type] || "bg-gray-100 text-gray-600"}`}>
                                        {job.type}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-tight mb-1 group-hover:text-[#a60303] transition-colors">{job.title}</h3>
                                {job.department && <p className="text-xs font-bold text-[#a60303] uppercase tracking-wider">{job.department}</p>}
                            </div>

                            <div className="flex flex-wrap gap-4">
                                {job.location && (
                                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold">
                                        <MapPin size={13} className="text-[#a60303]" /> {job.location}
                                    </div>
                                )}
                                {job.salary_range && (
                                    <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
                                        <span className="text-[#a60303] font-black text-sm leading-none">{job.salary_icon || "$"}</span>
                                        <span>{job.salary_range}</span>
                                    </div>
                                )}
                            </div>

                            {job.description && (
                                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: (job.description || "").replace(/<[^>]+>/g, " ").trim() }}
                                />
                            )}

                            <div className="flex gap-3 mt-auto pt-2">
                                <button
                                    onClick={() => setApplyJob(job)}
                                    className="flex-1 bg-[#a60303] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#800202] transition-colors"
                                >
                                    Apply Now
                                </button>
                                <a
                                    href={`/career/${generateSlug(job.title)}`}
                                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:border-[#a60303] hover:text-[#a60303] transition-colors"
                                >
                                    Details <ChevronRight size={14} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {applyJob && <JobApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
        </>
    );
}
