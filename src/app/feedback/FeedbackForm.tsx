"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Star } from "lucide-react";
import { createClient } from "@/lib/supabase";
import ImageUploadField from "@/components/admin/ImageUploadField";

type Props = {
    prefillName?: string;
};

export default function FeedbackForm({ prefillName = "" }: Props) {
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null);
    const [certificateUrlPreview, setCertificateUrlPreview] = useState<string | null>(null);
    const [form, setForm] = useState({
        student_name: prefillName,
        course_name: "",
        company_name: "",
        linkedin_url: "",
        video_url: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setStatus("submitting");

            const supabase = createClient();
            const { error } = await supabase.from("success_stories").insert([{
                ...form,
                rating,
                image_url: imageUrlPreview,
                certificate_url: certificateUrlPreview,
                is_approved: false  // Admin must approve before it appears on the website
            }]);

            if (error) throw error;
            setStatus("success");

        } catch (error) {
            console.error("Error submitting feedback:", error);
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-10 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-4">Thank You!</h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Your success story has been submitted and is pending review. Once approved it will appear on the Success Stories page and inspire countless other students.
                    </p>
                    <Link href="/success-stories" className="bg-[var(--primary)] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[var(--primary-dark)] transition-colors inline-block">
                        View Success Stories
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
                <Link href="/success-stories" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--primary)] font-medium transition-colors mb-8">
                    <ArrowLeft size={16} /> Back to Success Stories
                </Link>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden">
                    <div className="bg-[#1a1a1a] p-8 text-center border-b border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-30" />
                        <h1 className="text-3xl font-black text-white mb-2 relative z-10">Share Your Success Story</h1>
                        <p className="text-red-100 relative z-10">Inspire others by sharing how First Bencher helped you achieve your goals.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {status === "error" && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-sm text-center mb-6">
                                Something went wrong submitting your form. Please try again or contact support.
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Your Full Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    value={form.student_name}
                                    onChange={e => setForm({ ...form, student_name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white"
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Course Taken <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        value={form.course_name}
                                        onChange={e => setForm({ ...form, course_name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white"
                                        placeholder="e.g. PMP Certification"
                                    />
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
                                <label className="block text-sm font-bold text-gray-700 mb-2">How would you rate your experience?</label>
                                <div className="flex gap-1 items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <Star
                                                size={32}
                                                className={(hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                                            />
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
                                    placeholder="Share your experience with the course, how it helped your career, and any advice for future students..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <ImageUploadField
                                    label="Profile Photo (Optional)"
                                    value={imageUrlPreview || ""}
                                    onChange={v => setImageUrlPreview(v)}
                                    hideGallery={true}
                                    aspect={1}
                                />
                                <ImageUploadField
                                    label="Course Certificate (Optional)"
                                    value={certificateUrlPreview || ""}
                                    onChange={v => setCertificateUrlPreview(v)}
                                    hideGallery={true}
                                    aspect={1.414}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={status === "submitting"}
                                className="w-full bg-[var(--primary)] text-white py-4 rounded-xl font-bold text-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                            >
                                {status === "submitting" ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Submitting Story...
                                    </>
                                ) : "Submit Success Story"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
