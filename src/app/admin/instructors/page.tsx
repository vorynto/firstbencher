"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, ArrowLeft, Loader2, UserCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import ImageUploadField from "@/components/admin/ImageUploadField";

type Instructor = {
    id: string;
    name: string;
    title: string;
    qualification: string;
    experience: string;
    description: string;
    qualifications: string[];
    rating: number;
    review_count: number;
    profile_image_url: string;
    active: boolean;
    created_at?: string;
};

const defaultInstructor: Partial<Instructor> = {
    name: "",
    title: "",
    qualification: "",
    experience: "",
    description: "",
    qualifications: [],
    rating: 0,
    review_count: 0,
    profile_image_url: "",
    active: true,
};

export default function InstructorsPage() {
    const supabase = useMemo(() => createClient(), []);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"list" | "form">("list");
    const [editorData, setEditorData] = useState<Partial<Instructor>>(defaultInstructor);
    const [newQual, setNewQual] = useState("");
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchInstructors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("instructors")
            .select("*")
            .order("created_at", { ascending: false });
        if (!error && data) setInstructors(data);
        setLoading(false);
    };

    useEffect(() => {
        if (view === "list") fetchInstructors();
    }, [view]);

    const handleEdit = (instructor: Instructor) => {
        setEditorData({ ...instructor, qualifications: instructor.qualifications || [] });
        setNewQual("");
        setView("form");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this instructor?")) return;
        const { error } = await supabase.from("instructors").delete().match({ id });
        if (error) showToast("error", "Failed to delete instructor");
        else { showToast("success", "Instructor deleted"); fetchInstructors(); }
    };

    const addQual = () => {
        const trimmed = newQual.trim();
        if (!trimmed) return;
        const existing = editorData.qualifications || [];
        if (!existing.includes(trimmed)) {
            setEditorData({ ...editorData, qualifications: [...existing, trimmed] });
        }
        setNewQual("");
    };

    const removeQual = (q: string) =>
        setEditorData({ ...editorData, qualifications: (editorData.qualifications || []).filter(x => x !== q) });

    const handleSave = async () => {
        if (!editorData.name?.trim()) return showToast("error", "Name is required.");
        setSaving(true);
        const payload = {
            name: editorData.name?.trim() || "",
            title: editorData.title || "",
            qualification: editorData.qualification || "",
            experience: editorData.experience || "",
            description: editorData.description || "",
            qualifications: editorData.qualifications || [],
            rating: Number(editorData.rating) || 0,
            review_count: Number(editorData.review_count) || 0,
            profile_image_url: editorData.profile_image_url || "",
            active: editorData.active ?? true,
        };
        let err;
        if (editorData.id) {
            const { error } = await supabase.from("instructors").update(payload).match({ id: editorData.id });
            err = error;
        } else {
            const { error } = await supabase.from("instructors").insert([payload]);
            err = error;
        }
        setSaving(false);
        if (err) showToast("error", err.message || "Save failed");
        else { showToast("success", "Instructor saved!"); setTimeout(() => setView("list"), 1200); }
    };

    const filtered = instructors.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const base = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none text-sm";

    const formatReviews = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(2)}k` : String(n);

    return (
        <div className="flex flex-col gap-8 pb-20">
            {toast && (
                <div className={cn("fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-bold", toast.type === "success" ? "bg-green-500" : "bg-primary-tint0")}>
                    {toast.msg}
                </div>
            )}

            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-1">
                        {view === "list" ? "Instructors" : editorData.id ? "Edit Instructor" : "New Instructor"}
                    </h1>
                    <p className="text-muted-foreground">
                        {view === "list" ? "Manage course instructors." : "Fill in the instructor details below."}
                    </p>
                </div>
                {view === "list" ? (
                    <button
                        onClick={() => { setEditorData(defaultInstructor); setNewQual(""); setView("form"); }}
                        className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--primary-dark)] transition-colors shadow-sm text-sm"
                    >
                        <Plus size={18} /> Add Instructor
                    </button>
                ) : (
                    <button
                        onClick={() => setView("list")}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
                    >
                        <ArrowLeft size={16} /> Back to List
                    </button>
                )}
            </div>

            {/* LIST VIEW */}
            {view === "list" && (
                <div className="flex flex-col gap-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or title..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Instructor</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Rating</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto" /></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No instructors found.</td></tr>
                                ) : filtered.map(inst => (
                                    <tr key={inst.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {inst.profile_image_url ? (
                                                    <img src={inst.profile_image_url} alt={inst.name} className="w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0" />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 shrink-0">
                                                        <UserCircle2 className="text-gray-400" size={22} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900">{inst.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{inst.title || "—"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {inst.rating > 0 ? (
                                                <span className="flex items-center gap-1 text-sm font-bold text-gray-700">
                                                    ★ {inst.rating}
                                                    {inst.review_count > 0 && <span className="text-xs text-gray-400 font-normal ml-1">({formatReviews(inst.review_count)} Reviews)</span>}
                                                </span>
                                            ) : <span className="text-gray-400 text-sm">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", inst.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                                                {inst.active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEdit(inst)} className="p-2 text-gray-400 hover:text-[var(--primary)] transition-colors"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(inst.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* FORM VIEW */}
            {view === "form" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main */}
                    <div className="lg:col-span-2 flex flex-col gap-5">
                        {/* Basic Details */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
                            <h2 className="text-base font-bold border-b border-gray-100 pb-2">Basic Details</h2>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name *</label>
                                <input type="text" value={editorData.name || ""} onChange={e => setEditorData({ ...editorData, name: e.target.value })} placeholder="e.g. Dr. Jane Smith" className={base} />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Title / Role</label>
                                <input type="text" value={editorData.title || ""} onChange={e => setEditorData({ ...editorData, title: e.target.value })} placeholder="e.g. Senior Consultant, Instructor @ ITechGurus" className={base} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Rating (0–5)</label>
                                    <input type="number" min={0} max={5} step={0.1} value={editorData.rating || ""} onChange={e => setEditorData({ ...editorData, rating: parseFloat(e.target.value) || 0 })} placeholder="e.g. 4.9" className={base} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Review Count</label>
                                    <input type="number" min={0} value={editorData.review_count || ""} onChange={e => setEditorData({ ...editorData, review_count: parseInt(e.target.value) || 0 })} placeholder="e.g. 2150" className={base} />
                                </div>
                            </div>
                        </div>

                        {/* Experience / Bio */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
                            <h2 className="text-base font-bold border-b border-gray-100 pb-2">Experience / Bio</h2>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Experience Description</label>
                                <p className="text-xs text-gray-400">Shown as the "Experience" section on the course page.</p>
                                <textarea rows={6} value={editorData.description || ""} onChange={e => setEditorData({ ...editorData, description: e.target.value })} placeholder="Describe the instructor's professional background and expertise..." className={cn(base, "resize-none")} />
                            </div>
                        </div>

                        {/* Qualifications */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
                            <h2 className="text-base font-bold border-b border-gray-100 pb-2">Qualifications / Certifications</h2>
                            <p className="text-xs text-gray-400 -mt-2">These appear as pills/tags on the course page (e.g. PMP®, PMI®-ACP, DASSM).</p>

                            {/* Existing tags */}
                            {(editorData.qualifications || []).length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {(editorData.qualifications || []).map(q => (
                                        <span key={q} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                                            {q}
                                            <button type="button" onClick={() => removeQual(q)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Add new tag */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newQual}
                                    onChange={e => setNewQual(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addQual(); } }}
                                    placeholder="e.g. PMP®, CSM®, ITIL®..."
                                    className={cn(base, "flex-1")}
                                />
                                <button
                                    type="button"
                                    onClick={addQual}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-200 whitespace-nowrap"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-6">
                        <section className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-5">
                            <div className="flex justify-between items-center">
                                <h2 className="text-base font-bold">Status</h2>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={editorData.active ?? true} onChange={e => setEditorData({ ...editorData, active: e.target.checked })} className="w-4 h-4 rounded text-[var(--primary)]" />
                                    <span className="text-sm font-bold text-gray-700">Active</span>
                                </label>
                            </div>
                            <button onClick={handleSave} disabled={saving} className="w-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={18} /> : "Save Instructor"}
                            </button>
                        </section>

                        <section className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-4">
                            <h2 className="text-base font-bold border-b border-gray-100 pb-2">Profile Photo</h2>
                            <ImageUploadField label="" value={editorData.profile_image_url || ""} onChange={v => setEditorData({ ...editorData, profile_image_url: v })} aspect={1} />
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}
