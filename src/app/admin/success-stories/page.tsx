"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import {
    Plus, Trash2, Edit2, Loader2, Star, MessageSquareQuote,
    Copy, CheckCircle2, X, ThumbsUp, ThumbsDown, Award, Clock, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import ImageUploadField from "@/components/admin/ImageUploadField";

type Story = {
    id: string;
    student_name: string;
    course_name: string;
    company_name: string;
    message: string;
    image_url: string;
    certificate_url: string;
    linkedin_url: string;
    video_url: string;
    rating: number;
    is_approved: boolean;
    created_at: string;
};

const defaultStory: Partial<Story> = {
    student_name: "",
    course_name: "",
    company_name: "",
    message: "",
    image_url: "",
    certificate_url: "",
    linkedin_url: "",
    video_url: "",
    rating: 5,
    is_approved: true,
};

type Tab = "pending" | "approved";

export default function AdminSuccessStoriesPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStory, setCurrentStory] = useState<Partial<Story>>(defaultStory);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("pending");
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const supabase = createClient();

    const fetchStories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("success_stories")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) setStories(data);
        setLoading(false);
    };

    useEffect(() => { fetchStories(); }, []);

    const pending = useMemo(() => stories.filter(s => !s.is_approved), [stories]);
    const approved = useMemo(() => stories.filter(s => s.is_approved), [stories]);
    const displayedStories = activeTab === "pending" ? pending : approved;

    const handleApprove = async (id: string) => {
        setApprovingId(id);
        await supabase.from("success_stories").update({ is_approved: true }).eq("id", id);
        await fetchStories();
        setApprovingId(null);
    };

    const handleReject = async (id: string) => {
        if (!window.confirm("Are you sure you want to reject and delete this story?")) return;
        setApprovingId(id);
        await supabase.from("success_stories").delete().eq("id", id);
        await fetchStories();
        setApprovingId(null);
    };

    const handleUnapprove = async (id: string) => {
        await supabase.from("success_stories").update({ is_approved: false }).eq("id", id);
        fetchStories();
    };

    const handleSave = async () => {
        if (!currentStory.student_name || !currentStory.message) {
            alert("Name and Message are required!");
            return;
        }
        setSaving(true);
        if (currentStory.id) {
            const { error } = await supabase.from("success_stories").update(currentStory).eq("id", currentStory.id);
            if (!error) { fetchStories(); setIsEditing(false); }
        } else {
            const { error } = await supabase.from("success_stories").insert([currentStory]);
            if (!error) { fetchStories(); setIsEditing(false); setActiveTab("approved"); }
        }
        setSaving(false);
    };

    const copyFeedbackLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/feedback`);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Success Stories</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Review public submissions and manage approved testimonials.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={copyFeedbackLink}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border",
                            copied ? "bg-green-500 text-white border-green-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} className="text-[#a60303]" />}
                        {copied ? "Link Copied!" : "Copy Feedback Link"}
                    </button>
                    <button
                        onClick={() => { setCurrentStory(defaultStory); setIsEditing(true); }}
                        className="flex items-center gap-2 bg-[#1E1E2F] hover:bg-[#2A2A40] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-black/10"
                    >
                        <Plus size={18} /> Add Story Manually
                    </button>
                </div>
            </div>

            {/* Add / Edit Form */}
            {isEditing && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900">{currentStory.id ? "Edit Story" : "Add Story Manually"}</h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 p-2"><X size={20} /></button>
                    </div>
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: "Student Name *", key: "student_name", type: "text" },
                                    { label: "Course Name", key: "course_name", type: "text" },
                                    { label: "Company Name", key: "company_name", type: "text" },
                                    { label: "Rating (1-5)", key: "rating", type: "number" },
                                ].map(({ label, key, type }) => (
                                    <div key={key} className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
                                        <input
                                            type={type}
                                            min={type === "number" ? 1 : undefined}
                                            max={type === "number" ? 5 : undefined}
                                            value={(currentStory as Record<string, string | number>)[key] ?? ""}
                                            onChange={e => setCurrentStory({ ...currentStory, [key]: type === "number" ? parseInt(e.target.value) : e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#a60303] focus:ring-4 focus:ring-red-100 transition-all outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: "LinkedIn URL", key: "linkedin_url" },
                                    { label: "Video URL", key: "video_url" },
                                ].map(({ label, key }) => (
                                    <div key={key} className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
                                        <input
                                            type="text"
                                            value={(currentStory as Record<string, string>)[key] ?? ""}
                                            onChange={e => setCurrentStory({ ...currentStory, [key]: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#a60303] focus:ring-4 focus:ring-red-100 transition-all outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Story Message *</label>
                                <textarea
                                    rows={5}
                                    value={currentStory.message ?? ""}
                                    onChange={e => setCurrentStory({ ...currentStory, message: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#a60303] focus:ring-4 focus:ring-red-100 transition-all outline-none resize-none leading-relaxed"
                                />
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentStory.is_approved ?? true}
                                        onChange={e => setCurrentStory({ ...currentStory, is_approved: e.target.checked })}
                                        className="w-5 h-5 rounded text-[#a60303] focus:ring-[#a60303] border-gray-300"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Approved (visible on website)</span>
                                </label>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                                    <button onClick={handleSave} disabled={saving} className="bg-[#a60303] hover:bg-[#800202] text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#a60303]/30 disabled:opacity-50 flex items-center gap-2">
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : "Save Story"}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6 lg:pl-10 lg:border-l border-gray-100">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student Photo</label>
                                <ImageUploadField
                                    value={currentStory.image_url ?? ""}
                                    onChange={url => setCurrentStory({ ...currentStory, image_url: url })}
                                />
                                <p className="text-xs text-gray-400">Recommended: Square image (min 200x200px)</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Certificate Image</label>
                                <ImageUploadField
                                    value={currentStory.certificate_url ?? ""}
                                    onChange={url => setCurrentStory({ ...currentStory, certificate_url: url })}
                                />
                                <p className="text-xs text-gray-400">Upload the student's course certificate</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-3">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                        activeTab === "pending"
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                >
                    <Clock size={16} />
                    Pending Review
                    {pending.length > 0 && (
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-black", activeTab === "pending" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700")}>
                            {pending.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("approved")}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                        activeTab === "approved"
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                >
                    <CheckCircle2 size={16} />
                    Approved & Live
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-black", activeTab === "approved" ? "bg-white/20 text-white" : "bg-green-100 text-green-700")}>
                        {approved.length}
                    </span>
                </button>
            </div>

            {/* Stories Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                        <Loader2 size={32} className="animate-spin text-[#a60303]" />
                        <p className="font-medium">Loading stories...</p>
                    </div>
                ) : displayedStories.length === 0 ? (
                    <div className="text-center py-20 px-4">
                        {activeTab === "pending" ? (
                            <>
                                <CheckCircle2 size={56} className="text-green-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">All caught up!</h3>
                                <p className="text-gray-500">No stories are pending review. Share the feedback link to get more submissions.</p>
                            </>
                        ) : (
                            <>
                                <MessageSquareQuote size={56} className="text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No approved stories yet</h3>
                                <p className="text-gray-500 mb-6">Approve stories from the Pending Review tab or add one manually.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {displayedStories.map((story) => (
                            <div key={story.id} className="p-6 hover:bg-gray-50/40 transition-colors group">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Student Info */}
                                    <div className="flex items-start gap-4 flex-shrink-0">
                                        {story.image_url ? (
                                            <img src={story.image_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm flex-shrink-0" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#a60303] to-[#c60404] flex items-center justify-center text-white font-black text-xl shadow-sm flex-shrink-0">
                                                {story.student_name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-[160px]">
                                            <p className="font-black text-gray-900 text-base">{story.student_name}</p>
                                            {story.course_name && <p className="text-xs text-[#a60303] font-bold mt-0.5">{story.course_name}</p>}
                                            {story.company_name && <p className="text-xs text-gray-500 mt-0.5">{story.company_name}</p>}
                                            <div className="flex mt-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < (story.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1.5">
                                                {new Date(story.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-700 leading-relaxed italic line-clamp-4">"{story.message}"</p>

                                        {/* Certificate thumbnail */}
                                        {story.certificate_url && (
                                            <a href={story.certificate_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 text-xs font-bold text-[#a60303] hover:text-[#800202] transition-colors bg-red-50 px-3 py-1.5 rounded-lg">
                                                <Award size={14} /> View Certificate
                                            </a>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col gap-2 flex-shrink-0 justify-start">
                                        {activeTab === "pending" ? (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(story.id)}
                                                    disabled={approvingId === story.id}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-green-500/20 min-w-[130px] justify-center"
                                                >
                                                    {approvingId === story.id ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={15} />}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(story.id)}
                                                    disabled={approvingId === story.id}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 border border-red-100 min-w-[130px] justify-center"
                                                >
                                                    <ThumbsDown size={15} /> Reject
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => { setCurrentStory(story); setIsEditing(true); }}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors min-w-[130px] justify-center"
                                                >
                                                    <Edit2 size={15} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleUnapprove(story.id)}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-bold rounded-xl transition-colors border border-amber-100 min-w-[130px] justify-center"
                                                >
                                                    <Eye size={15} /> Unpublish
                                                </button>
                                                <button
                                                    onClick={() => handleReject(story.id)}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors border border-red-100 min-w-[130px] justify-center"
                                                >
                                                    <Trash2 size={15} /> Delete
                                                </button>
                                            </>
                                        )}
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
