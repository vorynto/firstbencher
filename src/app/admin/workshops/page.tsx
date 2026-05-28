"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Calendar, MapPin, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { createClient } from "@/lib/supabase";
import ImageUploadField from "@/components/admin/ImageUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import Image from "next/image";

type Workshop = {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    category: string;
    image_url: string;
    active: boolean;
    link_type: string;
    link_slug: string;
};

type Course = {
    id: string;
    title: string;
    slug: string;
};

const defaultForm = {
    title: "",
    description: "",
    event_date: "",
    location: "",
    category: "",
    image_url: "",
    active: true,
    link_type: "workshop",
    link_slug: "",
};

export default function WorkshopsAdminPage() {
    const supabase = createClient();
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        fetchWorkshops();
        fetchCourses();
    }, []);

    const fetchWorkshops = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
        if (!error && data) setWorkshops(data as Workshop[]);
        setLoading(false);
    };

    const fetchCourses = async () => {
        const { data } = await supabase.from("courses").select("id, title, slug").eq("active", true).order("title");
        if (data) setCourses(data as Course[]);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            ...formData,
            event_date: formData.event_date || new Date().toISOString(),
            link_slug: formData.link_type === "course" ? formData.link_slug : "",
        };

        if (editingId) {
            await supabase.from("events").update(payload).eq("id", editingId);
        } else {
            await supabase.from("events").insert([payload]);
        }

        setIsAddMode(false);
        setEditingId(null);
        setFormData(defaultForm);
        fetchWorkshops();
        setSaving(false);
    };

    const handleEdit = (w: Workshop) => {
        let dateVal = w.event_date;
        if (dateVal?.includes("Z")) dateVal = new Date(dateVal).toISOString().slice(0, 16);
        setFormData({
            title: w.title || "",
            description: w.description || "",
            event_date: dateVal || "",
            location: w.location || "",
            category: w.category || "",
            image_url: w.image_url || "",
            active: w.active !== false,
            link_type: w.link_type || "workshop",
            link_slug: w.link_slug || "",
        });
        setEditingId(w.id);
        setIsAddMode(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this workshop?")) {
            await supabase.from("events").delete().eq("id", id);
            fetchWorkshops();
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (isAddMode) {
        return (
            <div className="bg-background rounded-2xl p-8 border">
                <h2 className="text-2xl font-bold mb-6">{editingId ? "Edit Workshop" : "Add New Workshop"}</h2>
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Title</label>
                        <input className="border p-3 rounded-lg" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Description</label>
                        <RichTextEditor value={formData.description} onChange={val => setFormData({ ...formData, description: val })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold">Event Date & Time</label>
                            <input type="datetime-local" className="border p-3 rounded-lg" value={formData.event_date} onChange={e => setFormData({ ...formData, event_date: e.target.value })} required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold">Location / Platform</label>
                            <input className="border p-3 rounded-lg" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold">Category</label>
                            <input className="border p-3 rounded-lg" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                        <div className="flex flex-col gap-2 justify-center pt-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="w-5 h-5" />
                                <span className="font-bold">Published (Active)</span>
                            </label>
                        </div>
                    </div>

                    {/* Know More Link */}
                    <div className="flex flex-col gap-3 p-5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                            <LinkIcon size={15} className="text-primary" />
                            <label className="text-sm font-bold">"Know More" Button Link</label>
                        </div>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="link_type"
                                    value="workshop"
                                    checked={formData.link_type === "workshop"}
                                    onChange={() => setFormData({ ...formData, link_type: "workshop", link_slug: "" })}
                                    className="accent-primary"
                                />
                                <span className="text-sm font-semibold">Workshop Detail Page</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="link_type"
                                    value="course"
                                    checked={formData.link_type === "course"}
                                    onChange={() => setFormData({ ...formData, link_type: "course" })}
                                    className="accent-primary"
                                />
                                <span className="text-sm font-semibold">Course Detail Page</span>
                            </label>
                        </div>

                        {formData.link_type === "course" && (
                            <div className="flex flex-col gap-1.5 mt-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Course</label>
                                <select
                                    value={formData.link_slug}
                                    onChange={e => setFormData({ ...formData, link_slug: e.target.value })}
                                    className="border p-3 rounded-lg text-sm bg-white"
                                    required={formData.link_type === "course"}
                                >
                                    <option value="">— Choose a course —</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.slug}>{c.title}</option>
                                    ))}
                                </select>
                                {formData.link_slug && (
                                    <p className="text-xs text-gray-400">Links to: <span className="font-semibold text-gray-600">/courses/{formData.link_slug}</span></p>
                                )}
                            </div>
                        )}

                        {formData.link_type === "workshop" && (
                            <p className="text-xs text-gray-400">Links to the auto-generated workshop detail page for this event.</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Cover Image</label>
                        <ImageUploadField value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} />
                    </div>

                    <div className="flex justify-end gap-4 mt-4">
                        <button type="button" onClick={() => { setIsAddMode(false); setFormData(defaultForm); setEditingId(null); }} className="px-6 py-3 rounded-lg font-bold hover:bg-muted">Cancel</button>
                        <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2">
                            {saving ? <><Loader2 className="animate-spin" size={18} /> Saving…</> : "Save Workshop"}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-2">Workshops</h1>
                    <p className="text-muted-foreground">Schedule and manage active workshops.</p>
                </div>
                <button onClick={() => { setFormData(defaultForm); setEditingId(null); setIsAddMode(true); }} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                    <Plus size={20} /> Add Workshop
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workshops.map((w) => (
                    <div key={w.id} className="bg-background border rounded-[30px] p-6 hover:shadow-xl transition-all group flex flex-col gap-4">
                        <div className="relative w-full h-40 bg-muted rounded-2xl overflow-hidden shadow-inner">
                            {w.image_url ? (
                                <Image src={w.image_url} alt={w.title} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full"><ImageIcon size={40} className="text-muted-foreground/30" /></div>
                            )}
                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${w.active ? "bg-green-500 text-white shadow-lg" : "bg-muted text-muted-foreground"}`}>
                                    {w.active ? "Published" : "Draft"}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-3 leading-tight">{w.title}</h3>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Calendar size={14} className="text-primary" />
                                    <span className="text-xs font-bold">{new Date(w.event_date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <MapPin size={14} className="text-primary" />
                                    <span className="text-xs font-bold">{w.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <LinkIcon size={14} className="text-primary" />
                                    <span className="text-xs font-bold">
                                        {w.link_type === "course" && w.link_slug
                                            ? `→ Course: /courses/${w.link_slug}`
                                            : "→ Workshop detail page"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(w)} className="p-2 rounded-lg hover:bg-accent text-primary transition-all">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(w.id)} className="p-2 rounded-lg hover:bg-primary-tint text-red-500 transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {workshops.length === 0 && (
                <div className="text-center p-12 bg-white/50 border border-dashed rounded-3xl">
                    <p className="text-muted-foreground font-bold">No workshops found. Create your first one!</p>
                </div>
            )}
        </div>
    );
}
