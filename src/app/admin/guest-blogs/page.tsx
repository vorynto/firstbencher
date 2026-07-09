"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase";
import {
    Trash2, Edit2, Loader2, Clock, CheckCircle2, XCircle,
    ThumbsUp, ThumbsDown, X, Mail, Calendar, RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import ImageUploadField from "@/components/admin/ImageUploadField";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

type Status = "pending" | "approved" | "rejected";

type GuestBlog = {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    author: string;
    submitter_email: string | null;
    image_url: string;
    status: Status;
    published_at: string;
    created_at: string;
};

const TABS: { key: Status; label: string; icon: typeof Clock; activeClass: string; badgeClass: string }[] = [
    { key: "pending", label: "Pending Review", icon: Clock, activeClass: "bg-amber-500 text-white shadow-lg shadow-amber-500/20", badgeClass: "bg-amber-100 text-amber-700" },
    { key: "approved", label: "Approved & Live", icon: CheckCircle2, activeClass: "bg-green-500 text-white shadow-lg shadow-green-500/20", badgeClass: "bg-green-100 text-green-700" },
    { key: "rejected", label: "Rejected", icon: XCircle, activeClass: "bg-gray-700 text-white shadow-lg shadow-gray-700/20", badgeClass: "bg-gray-200 text-gray-700" },
];

function slugify(str: string) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export default function AdminGuestBlogsPage() {
    const supabase = useMemo(() => createClient(), []);
    const [posts, setPosts] = useState<GuestBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Status>("pending");
    const [busyId, setBusyId] = useState<string | null>(null);
    const [editing, setEditing] = useState<GuestBlog | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("blogs")
            .select("id, title, slug, content, excerpt, author, submitter_email, image_url, status, published_at, created_at")
            .eq("is_guest_submission", true)
            .order("created_at", { ascending: false });
        if (!error && data) setPosts(data as GuestBlog[]);
        setLoading(false);
    };

    useEffect(() => { fetchPosts(); }, []);

    const byTab = useMemo(() => {
        const grouped: Record<Status, GuestBlog[]> = { pending: [], approved: [], rejected: [] };
        for (const p of posts) grouped[p.status]?.push(p);
        return grouped;
    }, [posts]);

    const displayed = byTab[activeTab];

    const setStatus = async (id: string, status: Status) => {
        setBusyId(id);
        const payload: Record<string, unknown> = { status };
        if (status === "approved") payload.published_at = new Date().toISOString();
        const { error } = await supabase.from("blogs").update(payload).eq("id", id);
        if (error) showToast("error", "Failed to update status.");
        else {
            showToast("success", status === "approved" ? "Post approved and published!" : status === "rejected" ? "Post rejected." : "Post updated.");
            await fetchPosts();
        }
        setBusyId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this guest post permanently? This cannot be undone.")) return;
        setBusyId(id);
        const { error } = await supabase.from("blogs").delete().eq("id", id);
        if (error) showToast("error", "Failed to delete post.");
        else {
            showToast("success", "Post deleted.");
            await fetchPosts();
        }
        setBusyId(null);
    };

    const handleSaveEdit = async () => {
        if (!editing) return;
        if (!editing.title.trim() || !editing.slug.trim()) {
            showToast("error", "Title and Slug are required.");
            return;
        }
        setSaving(true);
        const { error } = await supabase.from("blogs").update({
            title: editing.title.trim(),
            slug: slugify(editing.slug),
            excerpt: editing.excerpt,
            author: editing.author,
            image_url: editing.image_url,
            content: editing.content,
        }).eq("id", editing.id);
        setSaving(false);
        if (error) {
            showToast("error", error.message || "Failed to save changes.");
        } else {
            showToast("success", "Changes saved.");
            setEditing(null);
            await fetchPosts();
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
            {toast && (
                <div className={cn("fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-bold", toast.type === "success" ? "bg-green-500" : "bg-red-500")}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Guest Blogs</h1>
                <p className="text-sm font-medium text-gray-500 mt-1">Review public guest-post submissions from /guest-blogging — approve, edit, reject, or delete.</p>
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0">
                            <h2 className="text-lg font-bold text-gray-900">Edit Guest Post</h2>
                            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 p-2"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title *</label>
                                    <input
                                        type="text"
                                        value={editing.title}
                                        onChange={e => setEditing({ ...editing, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/20 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">URL Slug *</label>
                                    <input
                                        type="text"
                                        value={editing.slug}
                                        onChange={e => setEditing({ ...editing, slug: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/20 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Author Name</label>
                                    <input
                                        type="text"
                                        value={editing.author || ""}
                                        onChange={e => setEditing({ ...editing, author: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/20 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Submitter Email</label>
                                    <input type="text" disabled value={editing.submitter_email || "—"} className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Short Excerpt</label>
                                <textarea
                                    rows={3}
                                    value={editing.excerpt || ""}
                                    onChange={e => setEditing({ ...editing, excerpt: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/20 transition-all outline-none resize-none leading-relaxed"
                                />
                            </div>
                            <ImageUploadField label="Feature Image" value={editing.image_url || ""} onChange={url => setEditing({ ...editing, image_url: url })} />
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content</label>
                                <RichTextEditor value={editing.content || ""} onChange={v => setEditing({ ...editing, content: v })} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button onClick={() => setEditing(null)} className="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                                <button onClick={handleSaveEdit} disabled={saving} className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[var(--primary)]/30 disabled:opacity-50 flex items-center gap-2">
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-3 flex-wrap">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const count = byTab[tab.key].length;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                                active ? tab.activeClass : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            <Icon size={16} />
                            {tab.label}
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-black", active ? "bg-white/20 text-white" : tab.badgeClass)}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                        <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
                        <p className="font-medium">Loading guest posts...</p>
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="text-center py-20 px-4">
                        <CheckCircle2 size={56} className="text-green-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Nothing here</h3>
                        <p className="text-gray-500">No {activeTab} guest posts right now.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {displayed.map(post => (
                            <div key={post.id} className="p-6 hover:bg-gray-50/40 transition-colors group">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Thumbnail */}
                                    <div className="flex-shrink-0">
                                        {post.image_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={post.image_url} alt="" className="w-24 h-24 rounded-xl object-cover border border-gray-100" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 font-black text-xl">
                                                {post.title.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-gray-900 text-base line-clamp-1">{post.title}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500 font-semibold">
                                            <span>By {post.author || "Unknown"}</span>
                                            {post.submitter_email && (
                                                <span className="flex items-center gap-1"><Mail size={12} /> {post.submitter_email}</span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(post.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">{post.excerpt || "No excerpt provided."}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col gap-2 flex-shrink-0 justify-start flex-wrap">
                                        {post.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => setStatus(post.id, "approved")}
                                                    disabled={busyId === post.id}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-green-500/20 min-w-[130px] justify-center"
                                                >
                                                    {busyId === post.id ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={15} />} Approve
                                                </button>
                                                <button
                                                    onClick={() => setStatus(post.id, "rejected")}
                                                    disabled={busyId === post.id}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-tint hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 border border-[var(--primary)]/20 min-w-[130px] justify-center"
                                                >
                                                    <ThumbsDown size={15} /> Reject
                                                </button>
                                            </>
                                        )}
                                        {post.status === "approved" && (
                                            <button
                                                onClick={() => setStatus(post.id, "rejected")}
                                                disabled={busyId === post.id}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-bold rounded-xl transition-colors border border-amber-100 min-w-[130px] justify-center"
                                            >
                                                <ThumbsDown size={15} /> Unpublish
                                            </button>
                                        )}
                                        {post.status === "rejected" && (
                                            <button
                                                onClick={() => setStatus(post.id, "approved")}
                                                disabled={busyId === post.id}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-green-500/20 min-w-[130px] justify-center"
                                            >
                                                <RotateCcw size={15} /> Reconsider
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setEditing(post)}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors min-w-[130px] justify-center"
                                        >
                                            <Edit2 size={15} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            disabled={busyId === post.id}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-primary-tint hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 border border-[var(--primary)]/20 min-w-[130px] justify-center"
                                        >
                                            <Trash2 size={15} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
