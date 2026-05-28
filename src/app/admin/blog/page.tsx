"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    ArrowLeft,
    Loader2,
    Calendar,
    User,
    CheckCircle2,
    CheckCircle,
    AlertCircle,
    X,
    FileText,
    Image as ImageIcon,
    Target,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import ImageUploadField from "@/components/admin/ImageUploadField";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

type Blog = {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    author: string;
    image_url: string;
    published_at: string;
    created_at?: string;
};

const defaultBlog: Partial<Blog> = {
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    author: "",
    image_url: "",
    published_at: new Date().toISOString()
};

// ── SEO ──────────────────────────────────────────────────────────
type BlogSeoData = {
    seoTitle: string;
    metaDescription: string;
    focusKeyword: string;
    supportingKeywords: string[];
};

const defaultBlogSeo: BlogSeoData = { seoTitle: "", metaDescription: "", focusKeyword: "", supportingKeywords: [] };

type SeoCheck = { pass: boolean; label: string; points: number; suggestion?: string };

function computeBlogSeoScore(
    seo: BlogSeoData,
    ctx: { title: string; slug: string; content: string }
): { score: number; checks: SeoCheck[] } {
    const title = (seo.seoTitle || ctx.title || "").trim();
    const desc = (seo.metaDescription || "").trim();
    const kw = (seo.focusKeyword || "").trim().toLowerCase();
    const slug = (ctx.slug || "").trim().toLowerCase();
    const kwSlug = kw.replace(/\s+/g, "-");
    const contentText = (ctx.content || "").replace(/<[^>]+>/g, " ").toLowerCase();
    const wordCount = contentText.split(/\s+/).filter(Boolean).length;
    const supporting = seo.supportingKeywords || [];
    const checks: SeoCheck[] = [];
    let score = 0;

    const add = (pass: boolean, label: string, points: number, suggestion?: string) => {
        if (pass) score += points;
        checks.push({ pass, label, points, suggestion });
    };

    add(title.length > 0, "SEO title is set", 5, "Add an SEO title to override the post title in search results");
    add(desc.length > 0, "Meta description is set", 5, "Write a compelling meta description");
    add(kw.length > 0, "Focus keyword is set", 5, "Enter the main keyword you want to rank for");

    if (kw) {
        add(title.toLowerCase().includes(kw), `Focus keyword in SEO title`, 15, `Add "${kw}" to your SEO title`);
        add(title.toLowerCase().startsWith(kw), `Focus keyword at start of SEO title`, 10, `Move "${kw}" to the beginning of your SEO title`);
        add(desc.toLowerCase().includes(kw), `Focus keyword in meta description`, 15, `Include "${kw}" naturally in your meta description`);
        add(slug.includes(kwSlug), `Focus keyword in URL slug`, 10, `Add "${kwSlug}" to the URL slug`);
        add(contentText.includes(kw), `Focus keyword used in content`, 5, `Use "${kw}" naturally in your article content`);
    } else {
        checks.push({ pass: false, label: "Focus keyword in SEO title (+15)", points: 15, suggestion: "Set a focus keyword first" });
        checks.push({ pass: false, label: "Focus keyword at start of title (+10)", points: 10, suggestion: "Set a focus keyword first" });
        checks.push({ pass: false, label: "Focus keyword in meta description (+15)", points: 15, suggestion: "Set a focus keyword first" });
        checks.push({ pass: false, label: "Focus keyword in URL slug (+10)", points: 10, suggestion: "Set a focus keyword first" });
        checks.push({ pass: false, label: "Focus keyword in content (+5)", points: 5, suggestion: "Set a focus keyword first" });
    }

    add(title.length >= 50 && title.length <= 60, `SEO title length 50-60 chars (${title.length})`, 10,
        title.length < 50 ? `Add ${50 - title.length} more characters` : `Remove ${title.length - 60} characters`);
    add(desc.length >= 120 && desc.length <= 160, `Meta description 120-160 chars (${desc.length})`, 10,
        desc.length < 120 ? `Add ${120 - desc.length} more characters` : `Remove ${desc.length - 160} characters`);
    add(supporting.length >= 2, `Supporting keywords added (${supporting.length}/2 min)`, 10, "Add at least 2 supporting keywords");
    add(wordCount >= 300, `Content length ≥ 300 words (${wordCount})`, 5, "Write at least 300 words for better rankings");

    return { score, checks };
}

export default function BlogManagementPage() {
    const supabase = createClient();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"list" | "form">("list");
    const [editorData, setEditorData] = useState<Partial<Blog>>(defaultBlog);
    const [seoData, setSeoData] = useState<BlogSeoData>(defaultBlogSeo);
    const [newKw, setNewKw] = useState("");
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    useEffect(() => {
        if (view === "list") fetchBlogs();
    }, [view]);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchBlogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("blogs")
            .select("*")
            .order("published_at", { ascending: false });
        
        if (!error && data) setBlogs(data);
        setLoading(false);
    };

    const handleEdit = async (blog: Blog) => {
        setEditorData(blog);
        const { data } = await supabase
            .from("pages_content")
            .select("content")
            .eq("page_name", `seo:blog:${blog.id}`)
            .maybeSingle();
        setSeoData(data?.content ? { ...defaultBlogSeo, ...(data.content as Partial<BlogSeoData>) } : defaultBlogSeo);
        setView("form");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog post?")) return;
        const { error } = await supabase.from("blogs").delete().match({ id });
        if (error) showToast("error", "Failed to delete blog post");
        else {
            showToast("success", "Blog post deleted successfully");
            fetchBlogs();
        }
    };

    const saveBlog = async () => {
        if (!editorData.title || !editorData.slug) {
            return showToast("error", "Title and Slug are required.");
        }
        setSaving(true);

        const payload = {
            ...editorData,
            published_at: editorData.published_at || new Date().toISOString()
        };

        let savedId = editorData.id;
        let err;

        if (editorData.id) {
            const { error } = await supabase.from("blogs").update(payload).match({ id: editorData.id });
            err = error;
        } else {
            const { data: inserted, error } = await supabase.from("blogs").insert([payload]).select("id").single();
            err = error;
            if (!err && inserted) savedId = inserted.id;
        }

        if (!err && savedId) {
            await supabase.from("pages_content").upsert(
                { page_name: `seo:blog:${savedId}`, content: seoData, updated_at: new Date().toISOString() },
                { onConflict: "page_name" }
            );
        }

        setSaving(false);

        if (err) {
            showToast("error", err.message || "Failed to save blog post.");
        } else {
            showToast("success", "Blog post saved successfully!");
            setTimeout(() => setView("list"), 1500);
        }
    };

    // Auto-generate slug from title
    useEffect(() => {
        if (!editorData.id && editorData.title) {
            const slug = editorData.title
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            setEditorData(prev => ({ ...prev, slug }));
        }
    }, [editorData.title, editorData.id]);

    const filtered = blogs.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-20">
            {toast && (
                <div className={cn(
                    "fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4",
                    toast.type === "success" ? "bg-green-500" : "bg-primary-tint0"
                )}>
                    <CheckCircle2 size={18} />
                    {toast.msg}
                </div>
            )}

            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-1">
                        {view === "list" ? "Blog Posts" : editorData.id ? "Edit Post" : "New Post"}
                    </h1>
                    <p className="text-muted-foreground whitespace-pre-line">
                        {view === "list" 
                            ? "Manage your company's insights and educational articles." 
                            : "Craft your story with images and rich formatting."}
                    </p>
                </div>
                {view === "list" ? (
                    <button
                        onClick={() => { setEditorData(defaultBlog); setSeoData(defaultBlogSeo); setView("form"); }}
                        className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--primary-dark)] transition-colors shadow-lg shadow-red-900/10"
                    >
                        <Plus size={18} /> Add New Post
                    </button>
                ) : (
                    <button 
                        onClick={() => setView("list")} 
                        className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all text-gray-600"
                    >
                        <ArrowLeft size={16} /> Back to List
                    </button>
                )}
            </div>

            {view === "list" && (
                <div className="flex flex-col gap-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by title or slug..." 
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none text-sm transition-all" 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
                                <Loader2 className="animate-spin" size={32} />
                                <p className="font-bold uppercase tracking-widest text-[10px]">Loading articles...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
                                <FileText className="mx-auto text-gray-200 mb-4" size={48} />
                                <p className="text-gray-500 font-bold">No blog posts found.</p>
                            </div>
                        ) : filtered.map(blog => (
                            <div key={blog.id} className="bg-white border border-gray-100 rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-red-900/5 transition-all group flex flex-col">
                                <div className="relative h-48 bg-gray-50">
                                    {blog.image_url ? (
                                        <img src={blog.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        {new Date(blog.published_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-lg font-black text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-[var(--primary)] transition-colors">{blog.title}</h3>
                                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <User size={12} className="text-[var(--primary)]" />
                                            {blog.author || "First Bencher"}
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(blog)} className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-primary-tint rounded-lg transition-all"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(blog.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-primary-tint rounded-lg transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === "form" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <section className="bg-white p-8 rounded-[32px] border border-gray-100 flex flex-col gap-6 shadow-sm">
                            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--primary)] border-b border-gray-50 pb-4 mb-2">Editor</h2>
                            
                            <div className="flex flex-col gap-6">
                                <Field 
                                    label="Article Title *" 
                                    value={editorData.title || ""} 
                                    onChange={v => setEditorData({ ...editorData, title: v })} 
                                    placeholder="Enter a compelling title..." 
                                />
                                <Field 
                                    label="URL Slug *" 
                                    value={editorData.slug || ""} 
                                    onChange={v => setEditorData({ ...editorData, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} 
                                    placeholder="e.g. how-to-master-ai" 
                                />
                                <Field 
                                    label="Short Excerpt (SEO Summary)" 
                                    value={editorData.excerpt || ""} 
                                    onChange={v => setEditorData({ ...editorData, excerpt: v })} 
                                    type="textarea" 
                                    placeholder="A brief summary for cards and search engines..." 
                                    rows={3} 
                                />
                                
                                <RichTextEditor 
                                    label="Full Content *" 
                                    value={editorData.content || ""} 
                                    onChange={v => setEditorData({ ...editorData, content: v })} 
                                    placeholder="Write your article content here..." 
                                />
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Column */}
                    <div className="flex flex-col gap-6">
                        <section className="bg-white p-8 rounded-[32px] border border-gray-100 flex flex-col gap-6 shadow-sm">
                            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--primary)] border-b border-gray-50 pb-4 mb-2">Publishing</h2>
                            
                            <button 
                                onClick={saveBlog} 
                                disabled={saving} 
                                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-red-900/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : "Publish Article"}
                            </button>

                            <Field 
                                label="Author Name" 
                                value={editorData.author || ""} 
                                onChange={v => setEditorData({ ...editorData, author: v })} 
                                placeholder="e.g. John Smith" 
                            />

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Publish Date</label>
                                <input 
                                    type="date" 
                                    value={editorData.published_at?.split('T')[0] || ""} 
                                    onChange={e => setEditorData({ ...editorData, published_at: new Date(e.target.value).toISOString() })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)]"
                                />
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-[32px] border border-gray-100 flex flex-col gap-6 shadow-sm">
                            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--primary)] border-b border-gray-50 pb-4 mb-2">Media</h2>
                            <ImageUploadField
                                label="Feature Image"
                                value={editorData.image_url || ""}
                                onChange={v => setEditorData({ ...editorData, image_url: v })}
                            />
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                                Recommended size: 1200x630px for better social sharing.
                            </p>
                        </section>

                        {/* ── SEO Panel ── */}
                        <BlogSeoPanel
                            seoData={seoData}
                            setSeoData={setSeoData}
                            newKw={newKw}
                            setNewKw={setNewKw}
                            blogTitle={editorData.title || ""}
                            blogSlug={editorData.slug || ""}
                            blogContent={editorData.content || ""}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Components ──────────────────────────────────────────────────

function BlogSeoPanel({
    seoData,
    setSeoData,
    newKw,
    setNewKw,
    blogTitle,
    blogSlug,
    blogContent,
}: {
    seoData: BlogSeoData;
    setSeoData: React.Dispatch<React.SetStateAction<BlogSeoData>>;
    newKw: string;
    setNewKw: (v: string) => void;
    blogTitle: string;
    blogSlug: string;
    blogContent: string;
}) {
    const { score, checks } = computeBlogSeoScore(seoData, { title: blogTitle, slug: blogSlug, content: blogContent });
    const scoreColor = score >= 80 ? "#16a34a" : score >= 50 ? "#ea580c" : "#dc2626";
    const scoreLabel = score >= 80 ? "Good" : score >= 50 ? "Needs Work" : "Poor";

    const addKw = () => {
        const t = newKw.trim();
        if (!t || seoData.supportingKeywords.includes(t)) return;
        setSeoData(s => ({ ...s, supportingKeywords: [...s.supportingKeywords, t] }));
        setNewKw("");
    };

    const inputCls = "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none bg-white";

    return (
        <div className="flex flex-col gap-4">
            {/* Score card */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Target size={16} className="text-[var(--primary)]" />
                    <h3 className="font-black text-gray-900 text-sm">SEO Score</h3>
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-20 h-20 shrink-0">
                        <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                            <circle
                                cx="18" cy="18" r="15.9" fill="none"
                                stroke={scoreColor} strokeWidth="3" strokeLinecap="round"
                                strokeDasharray={`${score} 100`}
                                style={{ transition: "stroke-dasharray 0.5s ease" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black" style={{ color: scoreColor }}>{score}</span>
                            <span className="text-[9px] font-bold text-gray-400">/100</span>
                        </div>
                    </div>
                    <div>
                        <p className="font-black text-lg" style={{ color: scoreColor }}>{scoreLabel}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                            {score >= 80 ? "Great SEO! Keep it up." : score >= 50 ? "Fix the issues below to improve." : "Several improvements needed."}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                    {checks.map((chk, i) => (
                        <div key={i} className={cn("flex items-start gap-2 p-2 rounded-lg text-xs", chk.pass ? "bg-green-50" : "bg-primary-tint")}>
                            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5", chk.pass ? "bg-green-500" : "bg-red-400")}>
                                {chk.pass ? <CheckCircle size={10} className="text-white" /> : <AlertCircle size={10} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn("font-semibold leading-snug", chk.pass ? "text-green-800" : "text-red-700")}>{chk.label}</p>
                                {!chk.pass && chk.suggestion && (
                                    <p className="text-red-500 mt-0.5 leading-snug">{chk.suggestion}</p>
                                )}
                            </div>
                            <span className={cn("text-[10px] font-black shrink-0", chk.pass ? "text-green-600" : "text-gray-400")}>+{chk.points}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEO fields */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                    <TrendingUp size={16} className="text-[var(--primary)]" />
                    <h3 className="font-black text-gray-900 text-sm">SEO Settings</h3>
                </div>

                {/* SEO Title */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">SEO Title</label>
                        <span className={cn("text-[10px] font-bold", seoData.seoTitle.length > 60 ? "text-red-500" : seoData.seoTitle.length >= 50 ? "text-green-600" : "text-gray-400")}>
                            {seoData.seoTitle.length}/60
                        </span>
                    </div>
                    <input
                        type="text"
                        value={seoData.seoTitle}
                        onChange={e => setSeoData(s => ({ ...s, seoTitle: e.target.value }))}
                        placeholder="Title shown in search results..."
                        className={inputCls}
                        maxLength={70}
                    />
                    <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all", seoData.seoTitle.length > 60 ? "bg-red-400" : seoData.seoTitle.length >= 50 ? "bg-green-400" : "bg-orange-300")}
                            style={{ width: `${Math.min(100, (seoData.seoTitle.length / 60) * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Meta Description</label>
                        <span className={cn("text-[10px] font-bold", seoData.metaDescription.length > 160 ? "text-red-500" : seoData.metaDescription.length >= 120 ? "text-green-600" : "text-gray-400")}>
                            {seoData.metaDescription.length}/160
                        </span>
                    </div>
                    <textarea
                        rows={3}
                        value={seoData.metaDescription}
                        onChange={e => setSeoData(s => ({ ...s, metaDescription: e.target.value }))}
                        placeholder="Compelling description for search results..."
                        className={cn(inputCls, "resize-none")}
                        maxLength={180}
                    />
                    <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all", seoData.metaDescription.length > 160 ? "bg-red-400" : seoData.metaDescription.length >= 120 ? "bg-green-400" : "bg-orange-300")}
                            style={{ width: `${Math.min(100, (seoData.metaDescription.length / 160) * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Focus Keyword */}
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Focus Keyword</label>
                    <input
                        type="text"
                        value={seoData.focusKeyword}
                        onChange={e => setSeoData(s => ({ ...s, focusKeyword: e.target.value }))}
                        placeholder="e.g. python course online"
                        className={inputCls}
                    />
                </div>

                {/* Supporting Keywords */}
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Supporting Keywords</label>
                    {seoData.supportingKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {seoData.supportingKeywords.map(kw => (
                                <span key={kw} className="flex items-center gap-1 px-2 py-1 bg-primary-tint text-[var(--primary)] rounded-lg text-xs font-semibold">
                                    {kw}
                                    <button onClick={() => setSeoData(s => ({ ...s, supportingKeywords: s.supportingKeywords.filter(k => k !== kw) }))} className="hover:text-red-700 transition-colors">
                                        <X size={10} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newKw}
                            onChange={e => setNewKw(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addKw(); } }}
                            placeholder="Add keyword..."
                            className={cn(inputCls, "flex-1")}
                        />
                        <button onClick={addKw} className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-200 whitespace-nowrap">Add</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

type FieldProps = {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    rows?: number;
};

function Field({ label, value, onChange, type = "text", placeholder = "", rows = 3 }: FieldProps) {
    const base = "w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white focus:ring-4 focus:ring-red-50 focus:border-[var(--primary)] outline-none text-sm font-bold text-gray-700 transition-all placeholder:text-gray-300";
    return (
        <div className="space-y-2">
            {label && <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>}
            {type === "textarea" ? (
                <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cn(base, "resize-none leading-relaxed")} />
            ) : (
                <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
            )}
        </div>
    );
}
