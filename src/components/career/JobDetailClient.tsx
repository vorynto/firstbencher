"use client";

import React, { useState } from "react";
import { MapPin, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import JobApplyModal from "./JobApplyModal";
import { sanitize } from "@/lib/sanitize";

type Job = {
    id: string;
    title: string;
    location: string | null;
    type: string | null;
    description: string | null;
    requirements: string | null;
    department: string | null;
    salary_range: string | null;
    salary_icon: string | null;
};

export default function JobDetailClient({ job }: { job: Job }) {
    const [applyOpen, setApplyOpen] = useState(false);

    return (
        <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <Link href="/career" className="inline-flex items-center gap-2 text-[#a60303] font-bold text-sm hover:gap-3 transition-all mb-8">
                    <ArrowLeft size={16} /> Back to Careers
                </Link>

                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                    {/* Job header */}
                    <div className="bg-[#111111] px-8 py-8">
                        <div className="flex flex-wrap gap-4 items-start justify-between">
                            <div>
                                <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">{job.department || "Open Position"}</p>
                                <h1 className="text-white font-black text-2xl leading-tight">{job.title}</h1>
                                <div className="flex flex-wrap gap-4 mt-3">
                                    {job.location && (
                                        <span className="flex items-center gap-1.5 text-gray-400 text-sm font-semibold">
                                            <MapPin size={14} className="text-red-400" /> {job.location}
                                        </span>
                                    )}
                                    {job.type && (
                                        <span className="flex items-center gap-1.5 text-gray-400 text-sm font-semibold">
                                            <Briefcase size={14} className="text-red-400" /> {job.type}
                                        </span>
                                    )}
                                    {job.salary_range && (
                                        <span className="flex items-center gap-1 text-gray-400 text-sm font-semibold">
                                            <span className="text-red-400 font-black">{job.salary_icon || "$"}</span>
                                            {job.salary_range}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setApplyOpen(true)}
                                className="bg-[#a60303] text-white px-7 py-3 rounded-2xl font-bold text-sm hover:bg-[#800202] transition-colors shrink-0"
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-10">
                        {job.description && (
                            <div>
                                <h2 className="text-lg font-black text-gray-900 mb-4">Job Description</h2>
                                <div
                                    className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: sanitize(job.description) }}
                                />
                            </div>
                        )}

                        {job.requirements && (
                            <div>
                                <h2 className="text-lg font-black text-gray-900 mb-4">Requirements</h2>
                                <div
                                    className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: sanitize(job.requirements) }}
                                />
                            </div>
                        )}

                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <p className="font-black text-gray-900">Ready to apply?</p>
                                <p className="text-sm text-gray-500 mt-0.5">Submit your application and we&apos;ll get back to you soon.</p>
                            </div>
                            <button
                                onClick={() => setApplyOpen(true)}
                                className="bg-[#a60303] text-white px-7 py-3 rounded-2xl font-bold text-sm hover:bg-[#800202] transition-colors shrink-0"
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {applyOpen && <JobApplyModal job={job} onClose={() => setApplyOpen(false)} />}
        </section>
    );
}
