"use client";

import React, { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Send, Loader2, CheckCircle2, ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

const inp = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";

function slugify(str: string) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

const defaultForm = {
    title: "",
    slug: "",
    excerpt: "",
    author: "",
    email: "",
    content: "",
};

export default function GuestBlogForm() {
    const [form, setForm] = useState(defaultForm);
    const [slugTouched, setSlugTouched] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const set = (k: keyof typeof defaultForm, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleTitleChange = (v: string) => {
        set("title", v);
        if (!slugTouched) set("slug", slugify(v));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError("");
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/guest-upload", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");
            setImageUrl(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Image upload failed. Please try again.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.slug.trim() || !form.author.trim() || !form.email.trim() || !form.content.trim()) {
            setError("Please fill in all required fields.");
            return;
        }
        setError("");
        setSubmitting(true);

        const supabase = createClient();
        const slug = slugify(form.slug);

        const { data: existing } = await supabase.from("blogs").select("id").eq("slug", slug).maybeSingle();
        if (existing) {
            setError("That URL slug is already taken — please choose a different one.");
            setSubmitting(false);
            return;
        }

        const { error: dbError } = await supabase.from("blogs").insert([{
            title: form.title.trim(),
            slug,
            excerpt: form.excerpt.trim(),
            author: form.author.trim(),
            submitter_email: form.email.trim(),
            image_url: imageUrl,
            content: form.content,
            status: "pending",
            is_guest_submission: true,
        }]);

        if (dbError) {
            setError("Something went wrong submitting your post. Please try again.");
            setSubmitting(false);
            return;
        }

        setSubmitting(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center gap-4 text-center py-16">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <div>
                    <p className="font-black text-xl text-gray-900">Thanks for your submission!</p>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-md mx-auto">
                        Your post is now pending review. Our editorial team will get back to you once it&apos;s been approved and published.
                    </p>
                </div>
                <button
                    onClick={() => { setForm(defaultForm); setImageUrl(""); setSlugTouched(false); setSubmitted(false); }}
                    className="mt-2 text-sm text-primary font-bold hover:underline"
                >
                    Submit another post
                </button>
            </div>
        );
    }

    return (
        <form className="flex flex-col gap-5 pb-10" onSubmit={handleSubmit}>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Title *</label>
                <input type="text" required className={inp} placeholder="How AI Is Reshaping Project Management" value={form.title} onChange={e => handleTitleChange(e.target.value)} />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">URL Slug *</label>
                <input
                    type="text"
                    required
                    className={inp}
                    placeholder="how-ai-is-reshaping-project-management"
                    value={form.slug}
                    onChange={e => { setSlugTouched(true); set("slug", e.target.value); }}
                />
                <p className="text-[11px] text-gray-400 mt-1">Your post will be published at /blog/{form.slug || "your-slug"}</p>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Short Excerpt</label>
                <textarea rows={3} className={inp + " resize-none"} placeholder="A one or two sentence summary of your article..." value={form.excerpt} onChange={e => set("excerpt", e.target.value)} />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Feature Image</label>
                {imageUrl ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
                        <Image src={imageUrl} alt="" fill className="object-cover" />
                        <button
                            type="button"
                            onClick={() => setImageUrl("")}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 cursor-pointer hover:border-primary/40 hover:text-primary transition-colors">
                        {uploading ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
                        <span className="text-xs font-semibold">{uploading ? "Uploading..." : "Click to upload an image (max 5MB)"}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageChange} disabled={uploading} />
                    </label>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Author Name *</label>
                    <input type="text" required className={inp} placeholder="Jane Doe" value={form.author} onChange={e => set("author", e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Your Email *</label>
                    <input type="email" required className={inp} placeholder="jane@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                    <p className="text-[11px] text-gray-400 mt-1">Kept private — used only if we need to reach you about your post.</p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Content *</label>
                <RichTextEditor value={form.content} onChange={v => set("content", v)} placeholder="Write your article here..." />
            </div>

            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

            <button type="submit" disabled={submitting || uploading}
                className="flex items-center justify-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-primary/30 hover:scale-105 transition-all text-sm disabled:opacity-60 disabled:scale-100 self-start">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <><Send size={16} /> Submit for Review</>}
            </button>
        </form>
    );
}
