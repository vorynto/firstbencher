"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Loader2, CheckCircle2, Clock, AlertCircle, Sparkles } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";

type MyStory = {
    id: string;
    course_name: string;
    message: string;
    rating: number;
    is_approved: boolean;
    created_at: string;
};

type Props = {
    fullName: string;
    courses: string[];
};

const defaultForm = {
    student_name: "",
    course_name: "",
    designation: "",
    company_name: "",
    linkedin_url: "",
    video_url: "",
    message: "",
};

export default function SuccessStoriesPortalClient({ fullName, courses }: Props) {
    const [myStories, setMyStories] = useState<MyStory[] | null>(null);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null);
    const [certificateUrlPreview, setCertificateUrlPreview] = useState<string | null>(null);
    const [form, setForm] = useState({ ...defaultForm, student_name: fullName });
    const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const loadStories = () => {
        fetch("/api/success-stories")
            .then(r => (r.ok ? r.json() : { stories: [] }))
            .then(data => setMyStories(data.stories || []))
            .catch(() => setMyStories([]));
    };

    useEffect(loadStories, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMsg("");
        try {
            const res = await fetch("/api/success-stories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    rating,
                    image_url: imageUrlPreview,
                    certificate_url: certificateUrlPreview,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Submission failed");
            }
            setForm({ ...defaultForm, student_name: fullName });
            setRating(5);
            setImageUrlPreview(null);
            setCertificateUrlPreview(null);
            setStatus("idle");
            loadStories();
        } catch (error) {
            setErrorMsg(error instanceof Error ? error.message : "Something went wrong. Please try again.");
            setStatus("error");
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Success Stories</h1>
                <p className="text-gray-500 mt-1 font-medium">Share your experience and inspire the next batch of students.</p>
            </div>

            {courses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-14 text-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles size={26} className="text-[var(--primary)]/50" />
                    </div>
                    <h3 className="font-black text-gray-900 mb-2">Purchase a course first</h3>
                    <p className="text-gray-500 mb-6 px-4">You can share a review once you&apos;ve completed a purchased course.</p>
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 bg-[var(--primary)] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
                    >
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h2 className="font-black text-gray-900">Write a Review</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {status === "error" && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-sm">
                                <AlertCircle size={16} className="shrink-0" />
                                {errorMsg}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={form.course_name}
                                    onChange={e => setForm({ ...form, course_name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white"
                                >
                                    <option value="">— Select a course —</option>
                                    {courses.map(title => (
                                        <option key={title} value={title}>{title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Your Designation <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="text"
                                    value={form.designation}
                                    onChange={e => setForm({ ...form, designation: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white"
                                    placeholder="e.g. Senior Project Manager"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Current Company <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <input
                                type="text"
                                value={form.company_name}
                                onChange={e => setForm({ ...form, company_name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="e.g. Google, Amazon"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">LinkedIn Profile <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="url"
                                    value={form.linkedin_url}
                                    onChange={e => setForm({ ...form, linkedin_url: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white"
                                    placeholder="https://linkedin.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Video Testimonial URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="url"
                                    value={form.video_url}
                                    onChange={e => setForm({ ...form, video_url: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white"
                                    placeholder="YouTube or Vimeo link"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Your Rating</label>
                            <div className="flex gap-1 items-center">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star size={30} className={(hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Your Story <span className="text-red-500">*</span></label>
                            <textarea
                                required
                                rows={5}
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white resize-none"
                                placeholder="Share your experience with the course and how it helped your career..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ImageUploadField label="Profile Photo (Optional)" value={imageUrlPreview || ""} onChange={v => setImageUrlPreview(v)} hideGallery aspect={1} />
                            <ImageUploadField label="Course Certificate (Optional)" value={certificateUrlPreview || ""} onChange={v => setCertificateUrlPreview(v)} hideGallery aspect={1.414} />
                        </div>

                        <button
                            type="submit"
                            disabled={status === "submitting"}
                            className="w-full bg-[var(--primary)] text-white py-4 rounded-xl font-bold hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {status === "submitting" ? <Loader2 size={18} className="animate-spin" /> : null}
                            {status === "submitting" ? "Submitting..." : "Submit Review"}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="font-black text-gray-900">Your Submitted Stories</h2>
                </div>
                {myStories === null ? (
                    <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-gray-300" size={24} /></div>
                ) : myStories.length === 0 ? (
                    <p className="px-6 py-8 text-sm text-gray-400 font-medium text-center">You haven&apos;t submitted a story yet.</p>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {myStories.map(s => (
                            <div key={s.id} className="flex items-center justify-between gap-4 px-6 py-4">
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{s.course_name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.message}</p>
                                </div>
                                <span
                                    className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full border ${
                                        s.is_approved
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                >
                                    {s.is_approved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                    {s.is_approved ? "Live" : "Pending"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
