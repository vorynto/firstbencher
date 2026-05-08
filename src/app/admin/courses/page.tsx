"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, ArrowLeft, Loader2, ListPlus, X, CheckCircle2, ChevronDown, ToggleLeft, ToggleRight, UserCircle2, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import ImageUploadField from "@/components/admin/ImageUploadField";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });
const TipTapEditor = dynamic(() => import("@/components/admin/TipTapEditor"), { ssr: false });

type Instructor = {
    id: string;
    name: string;
    qualification: string;
    experience: string;
    profile_image_url: string;
};

type Course = {
    id: string;
    title: string;
    slug: string;
    description: string;
    short_description: string;
    image_url: string;
    price: number | null;
    duration: string;
    category: string;
    active: boolean;
    tags: string[];
    rating: number;
    features: string[];
    requirements: string;
    popular_order: number;
    card_inner_text: string;
    review_count: number;
    instructor_ids: string[];
    created_at?: string;
    curriculum?: { title: string; lessons: string[] }[];
    faq?: { question: string; answer: string }[];
    batches?: any[];
    videos?: { title: string; url: string }[];
    tabs_enabled?: {
        overview: boolean;
        training_dates: boolean;
        key_features: boolean;
        curriculum: boolean;
        eligibility: boolean;
        faq: boolean;
        instructors: boolean;
        videos: boolean;
    };
};

const defaultTabsEnabled = {
    overview: true, training_dates: true, key_features: true,
    curriculum: true, eligibility: true, faq: true, instructors: true, videos: true,
};

const defaultCourse: Partial<Course> = {
    title: "", slug: "", description: "", short_description: "",
    image_url: "", price: 0, duration: "", category: "Project Management",
    active: true, tags: [], rating: 5.0, features: [], requirements: "", popular_order: 0,
    card_inner_text: "", review_count: 0, instructor_ids: [],
    curriculum: [], faq: [], batches: [], videos: [],
    tabs_enabled: { ...defaultTabsEnabled },
};

export default function CoursesPage() {
    const supabase = useMemo(() => createClient(), []);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"list" | "form" | "tags">("list");
    const [editorData, setEditorData] = useState<Partial<Course>>(defaultCourse);
    const [predefinedTags, setPredefinedTags] = useState<string[]>([]);
    const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    useEffect(() => {
        const fetchTags = async () => {
            const { data } = await supabase.from("pages_content").select("content").eq("page_name", "course_tags").single();
            if (data?.content && typeof data.content === 'object' && 'tags' in data.content && Array.isArray(data.content.tags)) {
                setPredefinedTags(data.content.tags as string[]);
            }
        };
        const fetchInstructors = async () => {
            const { data } = await supabase.from("instructors").select("id,name,qualification,experience,profile_image_url").eq("active", true).order("name");
            if (data) setAllInstructors(data);
        };
        fetchTags();
        fetchInstructors();
        if (view === "list") fetchCourses();
    }, [view]);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchCourses = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
        if (!error && data) setCourses(data);
        setLoading(false);
    };

    const handleEdit = (course: Course) => {
        setEditorData({ ...course, instructor_ids: course.instructor_ids || [] });
        setView("form");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this course?")) return;
        const { error } = await supabase.from("courses").delete().match({ id });
        if (error) showToast("error", "Failed to delete course");
        else {
            showToast("success", "Course deleted successfully");
            fetchCourses();
        }
    };

    const saveCourse = async () => {
        if (!editorData.title || !editorData.slug) return showToast("error", "Title and Slug are required.");
        setSaving(true);

        const payload = {
            ...editorData,
            tags: editorData.tags || [],
            features: editorData.features || [],
            requirements: editorData.requirements || "",
            curriculum: editorData.curriculum || [],
            faq: editorData.faq || [],
            popular_order: Number(editorData.popular_order) || 0,
            rating: Number(editorData.rating) || 5.0,
            price: Number(editorData.price) || 0,
            batches: editorData.batches || [],
            card_inner_text: editorData.card_inner_text || "",
            review_count: Number(editorData.review_count) || 0,
            instructor_ids: editorData.instructor_ids || [],
            videos: editorData.videos || [],
        };

        let err;
        if (editorData.id) {
            const { error } = await supabase.from("courses").update(payload).match({ id: editorData.id });
            err = error;
        } else {
            const { error } = await supabase.from("courses").insert([payload]);
            err = error;
        }

        setSaving(false);

        if (err) {
            showToast("error", err.message || "Failed to save course.");
        } else {
            showToast("success", "Course saved successfully!");
            setTimeout(() => setView("list"), 1500);
        }
    };

    const filtered = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || (c.slug && c.slug.toLowerCase().includes(searchTerm.toLowerCase())));

    return (
        <div className="flex flex-col gap-8 pb-20">
            {toast && (
                <div className={cn("fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-bold", toast.type === "success" ? "bg-green-500" : "bg-red-500")}>
                    {toast.msg}
                </div>
            )}

            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-1">{view === "list" ? "Courses" : editorData.id ? "Edit Course" : "New Course"}</h1>
                    <p className="text-muted-foreground">{view === "list" ? "Manage all your training programs here." : "Fill out the details below to publish your course."}</p>
                </div>
                {view === "list" ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <button onClick={() => setView("tags")} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm text-sm">
                            Manage Tags
                        </button>
                        <button onClick={() => { setEditorData(defaultCourse); setView("form"); }} className="bg-[#a60303] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#800202] transition-colors shadow-sm text-sm">
                            <Plus size={18} /> Add Course
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setView("list")} className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all">
                        <ArrowLeft size={16} /> Back to List
                    </button>
                )}
            </div>

            {view === "list" && (
                <div className="flex flex-col gap-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search by title or slug..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-[#a60303] outline-none text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Rating</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto" /></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No courses found.</td></tr>
                                ) : filtered.map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {course.image_url ? (
                                                    <img src={course.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-dashed border-gray-300"><Plus className="text-gray-400" size={16} /></div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900 line-clamp-1">{course.title}</p>
                                                    <div className="flex gap-2 items-center mt-1">
                                                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">/{course.slug}</span>
                                                        {course.tags?.map(t => <span key={t} className="text-[10px] font-bold text-[#a60303] bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{t}</span>)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <p className="font-bold text-gray-900">★ {course.rating}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", course.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                                                {course.active ? "Active" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEdit(course)} className="p-2 text-gray-400 hover:text-[#a60303] transition-colors"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(course.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === "form" && (
                <FormView
                    editorData={editorData}
                    setEditorData={setEditorData}
                    predefinedTags={predefinedTags}
                    allInstructors={allInstructors}
                    saving={saving}
                    saveCourse={saveCourse}
                />
            )}

            {view === "tags" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-5 max-w-2xl">
                    <h2 className="text-xl font-bold border-b border-gray-100 pb-2">Manage Course Tags</h2>
                    <ArrayBuilder label="Predefined Course Tags" data={predefinedTags} onChange={arr => {
                        setPredefinedTags(arr);
                    }} placeholder="e.g. Popular, Premium, Hot..." />
                    <button onClick={async () => {
                        setSaving(true);
                        const { error } = await supabase.from("pages_content").upsert({ page_name: "course_tags", content: { tags: predefinedTags } }, { onConflict: "page_name" });
                        setSaving(false);
                        if (error) showToast("error", "Failed to save tags");
                        else showToast("success", "Tags saved successfully!");
                    }} disabled={saving} className="bg-[#a60303] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#800202] mt-4">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : "Save Tags"}
                    </button>
                </div>
            )}
        </div>
    );
}

// ── AccordionSection ────────────────────────────────────────────

type AccordionSectionProps = {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    tabKey?: keyof typeof defaultTabsEnabled;
    tabEnabled?: boolean;
    onTabToggle?: () => void;
    badge?: string;
    children: React.ReactNode;
};

function AccordionSection({ title, isOpen, onToggle, tabKey, tabEnabled, onTabToggle, badge, children }: AccordionSectionProps) {
    return (
        <div className={cn("bg-white rounded-2xl border transition-all", isOpen ? "border-[#a60303]/30 shadow-sm" : "border-gray-200")}>
            <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3">
                    <ChevronDown
                        size={18}
                        className={cn("text-gray-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180")}
                    />
                    <span className="font-bold text-gray-900 text-sm">{title}</span>
                    {badge && (
                        <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{badge}</span>
                    )}
                </div>
                {tabKey && onTabToggle && (
                    <div
                        className="flex items-center gap-2 shrink-0 ml-4"
                        onClick={e => { e.stopPropagation(); onTabToggle(); }}
                        title={tabEnabled ? "Tab is visible — click to hide" : "Tab is hidden — click to show"}
                    >
                        <span className={cn("text-xs font-bold", tabEnabled ? "text-green-600" : "text-gray-400")}>
                            {tabEnabled ? "Visible" : "Hidden"}
                        </span>
                        {tabEnabled
                            ? <ToggleRight size={22} className="text-green-500" />
                            : <ToggleLeft size={22} className="text-gray-300" />}
                    </div>
                )}
            </div>
            {isOpen && (
                <div className="px-6 pb-6 flex flex-col gap-5 border-t border-gray-100 pt-5">
                    {!tabEnabled && tabKey && (
                        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-yellow-700">
                            <ToggleLeft size={15} /> This tab is currently hidden from the public course page.
                        </div>
                    )}
                    {children}
                </div>
            )}
        </div>
    );
}

// ── FormView ────────────────────────────────────────────────────

function FormView({
    editorData, setEditorData, predefinedTags, allInstructors, saving, saveCourse,
}: {
    editorData: Partial<Course>;
    setEditorData: (d: Partial<Course>) => void;
    predefinedTags: string[];
    allInstructors: Instructor[];
    saving: boolean;
    saveCourse: () => void;
}) {
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(["basic"]));

    const toggle = (id: string) =>
        setOpenSections(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const tabs = { ...defaultTabsEnabled, ...(editorData.tabs_enabled || {}) };

    const setTab = (key: keyof typeof defaultTabsEnabled) =>
        setEditorData({ ...editorData, tabs_enabled: { ...tabs, [key]: !tabs[key] } });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Main Content Column ── */}
            <div className="lg:col-span-2 flex flex-col gap-4">

                {/* Basic Info — no tab toggle, always open by default */}
                <AccordionSection title="Basic Info" isOpen={openSections.has("basic")} onToggle={() => toggle("basic")}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Course Title *" value={editorData.title || ""} onChange={v => setEditorData({ ...editorData, title: v })} placeholder="e.g. Master React in 30 Days" />
                        <Field label="URL Slug *" value={editorData.slug || ""} onChange={v => setEditorData({ ...editorData, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="e.g. master-react" />
                    </div>
                    <Field label="Short Description" value={editorData.short_description || ""} onChange={v => setEditorData({ ...editorData, short_description: v })} type="textarea" placeholder="A brief one-liner for the card view..." rows={2} />
                </AccordionSection>

                {/* Overview */}
                <AccordionSection
                    title="Overview / Full Description" isOpen={openSections.has("overview")} onToggle={() => toggle("overview")}
                    tabKey="overview" tabEnabled={tabs.overview} onTabToggle={() => setTab("overview")}
                >
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Content (Rich Text)</label>
                        <div className="border border-gray-200 rounded-lg overflow-hidden [&_.quill]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:min-h-[200px]">
                            <RichTextEditor value={editorData.description || ""} onChange={v => setEditorData({ ...editorData, description: v })} />
                        </div>
                    </div>
                </AccordionSection>

                {/* Key Features */}
                <AccordionSection
                    title="Key Features" isOpen={openSections.has("features")} onToggle={() => toggle("features")}
                    tabKey="key_features" tabEnabled={tabs.key_features} onTabToggle={() => setTab("key_features")}
                    badge={editorData.features?.length ? `${editorData.features.length} items` : undefined}
                >
                    <ArrayBuilder label="Feature Points" data={editorData.features || []} onChange={arr => setEditorData({ ...editorData, features: arr })} placeholder="e.g. 35+ Hours of Video Content" />
                </AccordionSection>

                {/* Eligibility */}
                <AccordionSection
                    title="Eligibility & Prerequisites" isOpen={openSections.has("eligibility")} onToggle={() => toggle("eligibility")}
                    tabKey="eligibility" tabEnabled={tabs.eligibility} onTabToggle={() => setTab("eligibility")}
                >
                    <TipTapEditor
                        value={editorData.requirements || ""}
                        onChange={v => setEditorData({ ...editorData, requirements: v })}
                        placeholder="Describe eligibility criteria and prerequisites..."
                    />
                </AccordionSection>

                {/* Curriculum */}
                <AccordionSection
                    title="Course Curriculum" isOpen={openSections.has("curriculum")} onToggle={() => toggle("curriculum")}
                    tabKey="curriculum" tabEnabled={tabs.curriculum} onTabToggle={() => setTab("curriculum")}
                    badge={editorData.curriculum?.length ? `${editorData.curriculum.length} sections` : undefined}
                >
                    <CurriculumBuilder data={editorData.curriculum || []} onChange={arr => setEditorData({ ...editorData, curriculum: arr })} />
                </AccordionSection>

                {/* FAQs */}
                <AccordionSection
                    title="Frequently Asked Questions" isOpen={openSections.has("faq")} onToggle={() => toggle("faq")}
                    tabKey="faq" tabEnabled={tabs.faq} onTabToggle={() => setTab("faq")}
                    badge={editorData.faq?.length ? `${editorData.faq.length} questions` : undefined}
                >
                    <FAQBuilder data={editorData.faq || []} onChange={arr => setEditorData({ ...editorData, faq: arr })} />
                </AccordionSection>

                {/* Training Dates */}
                <AccordionSection
                    title="Training Dates & Batches" isOpen={openSections.has("batches")} onToggle={() => toggle("batches")}
                    tabKey="training_dates" tabEnabled={tabs.training_dates} onTabToggle={() => setTab("training_dates")}
                    badge={editorData.batches?.length ? `${editorData.batches.length} batches` : undefined}
                >
                    <BatchBuilder data={editorData.batches || []} onChange={arr => setEditorData({ ...editorData, batches: arr })} />
                </AccordionSection>

                {/* Instructors */}
                <AccordionSection
                    title="Course Instructors" isOpen={openSections.has("instructors")} onToggle={() => toggle("instructors")}
                    tabKey="instructors" tabEnabled={tabs.instructors} onTabToggle={() => setTab("instructors")}
                    badge={(editorData.instructor_ids?.length || 0) > 0 ? `${editorData.instructor_ids!.length} selected` : undefined}
                >
                    {allInstructors.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No instructors found. <a href="/admin/instructors" className="text-[#a60303] font-bold underline">Add instructors first →</a></p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {allInstructors.map(inst => {
                                const selected = (editorData.instructor_ids || []).includes(inst.id);
                                return (
                                    <button
                                        key={inst.id}
                                        type="button"
                                        onClick={() => {
                                            const current = editorData.instructor_ids || [];
                                            setEditorData({
                                                ...editorData,
                                                instructor_ids: selected
                                                    ? current.filter(id => id !== inst.id)
                                                    : [...current, inst.id],
                                            });
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                            selected
                                                ? "border-[#a60303] bg-red-50 shadow-sm"
                                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                        )}
                                    >
                                        {inst.profile_image_url ? (
                                            <img src={inst.profile_image_url} alt={inst.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-dashed border-gray-300">
                                                <UserCircle2 size={20} className="text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("font-bold text-sm truncate", selected ? "text-[#a60303]" : "text-gray-800")}>{inst.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{inst.qualification || inst.experience || "—"}</p>
                                        </div>
                                        {selected && <CheckCircle2 size={16} className="text-[#a60303] shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </AccordionSection>

                {/* Videos */}
                <AccordionSection
                    title="Course Videos" isOpen={openSections.has("videos")} onToggle={() => toggle("videos")}
                    tabKey="videos" tabEnabled={tabs.videos} onTabToggle={() => setTab("videos")}
                    badge={(editorData.videos?.length ?? 0) > 0 ? `${editorData.videos!.length} videos` : undefined}
                >
                    <VideoBuilder
                        data={editorData.videos || []}
                        onChange={arr => setEditorData({ ...editorData, videos: arr })}
                    />
                </AccordionSection>
            </div>

            {/* ── Sidebar Column ── */}
            <div className="flex flex-col gap-6">
                <section className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base font-bold">Visibility</h2>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editorData.active ?? true} onChange={e => setEditorData({ ...editorData, active: e.target.checked })} className="w-4 h-4 rounded text-[#a60303]" />
                            <span className="text-sm font-bold text-gray-700">Published</span>
                        </label>
                    </div>
                    <button onClick={saveCourse} disabled={saving} className="w-full bg-[#a60303] hover:bg-[#800202] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : "Save Course"}
                    </button>
                </section>

                {/* Tab visibility summary */}
                <section className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-3">
                    <h2 className="text-base font-bold border-b border-gray-100 pb-2">Tab Visibility</h2>
                    <p className="text-xs text-gray-400">Toggle tabs directly on each section above.</p>
                    {([
                        ["overview", "Overview"],
                        ["training_dates", "Training Dates"],
                        ["key_features", "Key Features"],
                        ["curriculum", "Curriculum"],
                        ["eligibility", "Eligibility"],
                        ["faq", "FAQs"],
                        ["instructors", "Instructors"],
                        ["videos", "Videos"],
                    ] as [keyof typeof defaultTabsEnabled, string][]).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 font-medium">{label}</span>
                            <button
                                type="button"
                                onClick={() => setTab(key)}
                                className="flex items-center gap-1.5"
                            >
                                {tabs[key]
                                    ? <><ToggleRight size={20} className="text-green-500" /><span className="text-xs font-bold text-green-600">On</span></>
                                    : <><ToggleLeft size={20} className="text-gray-300" /><span className="text-xs font-bold text-gray-400">Off</span></>}
                            </button>
                        </div>
                    ))}
                </section>

                <section className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-5">
                    <h2 className="text-base font-bold border-b border-gray-100 pb-2">Media</h2>
                    <ImageUploadField label="Cover Image" value={editorData.image_url || ""} onChange={v => setEditorData({ ...editorData, image_url: v })} />
                </section>

                <section className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-5">
                    <h2 className="text-base font-bold border-b border-gray-100 pb-2">Details</h2>
                    <Field label="Duration" value={editorData.duration || ""} onChange={v => setEditorData({ ...editorData, duration: v })} placeholder="e.g. 5 Weeks" />
                    <Field label="Category" value={editorData.category || ""} onChange={v => setEditorData({ ...editorData, category: v })} />
                    <Field label="Rating (1–5)" type="number" value={editorData.rating?.toString() || "5"} onChange={v => setEditorData({ ...editorData, rating: parseFloat(v) })} />
                    <Field label="Enrolled Students Count" type="number" value={editorData.review_count?.toString() || "0"} onChange={v => setEditorData({ ...editorData, review_count: parseInt(v) })} placeholder="e.g. 12500" />
                    <p className="text-[10px] text-gray-400 italic -mt-3">Shown in the hero trust bar as &quot;X+ Students Enrolled &amp; Rated&quot;.</p>
                </section>

                <section className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-5">
                    <h2 className="text-base font-bold border-b border-gray-100 pb-2">Tags & Sorting</h2>
                    <div className="flex flex-col gap-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Select Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {predefinedTags.map(tag => {
                                const isSelected = (editorData.tags || []).includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            const current = editorData.tags || [];
                                            if (isSelected) setEditorData({ ...editorData, tags: current.filter(t => t !== tag) });
                                            else setEditorData({ ...editorData, tags: [...current, tag] });
                                        }}
                                        className={cn("px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors cursor-pointer", isSelected ? "bg-red-50 border-red-200 text-[#a60303]" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100")}
                                        type="button"
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                            {predefinedTags.length === 0 && <span className="text-xs text-gray-400 italic">No tags defined.</span>}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 italic leading-snug">Select &quot;Popular&quot; to show in the Popular Courses section on home.</p>
                    <Field label="Popular Order (Lower is first)" type="number" value={editorData.popular_order?.toString() || "0"} onChange={v => setEditorData({ ...editorData, popular_order: parseInt(v) })} />
                    <div className="pt-2 border-t border-gray-100">
                        <Field label="Card Header Text (Custom)" value={editorData.card_inner_text || ""} onChange={v => setEditorData({ ...editorData, card_inner_text: v })} placeholder="e.g. ADVANCED" />
                        <p className="text-[10px] text-gray-400 mt-1 italic">If empty, defaults to the first word of the course title.</p>
                    </div>
                </section>
            </div>
        </div>
    );
}

// ── Components ──────────────────────────────────────────────────

type FieldProps = {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    rows?: number;
};

function Field({ label, value, onChange, type = "text", placeholder = "", rows = 3 }: FieldProps) {
    const base = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-red-100 focus:border-[#a60303] outline-none text-sm";
    return (
        <div className="space-y-1.5 flex-1 w-full">
            {label && <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>}
            {type === "textarea" ? (
                <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cn(base, "resize-none")} />
            ) : (
                <input type={type} min={type === "number" ? 0 : undefined} step={type === "number" ? "any" : undefined} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
            )}
        </div>
    );
}

function ArrayBuilder({ label, data, onChange, placeholder }: { label: string, data: string[], onChange: (arr: string[]) => void, placeholder?: string }) {
    const [newItem, setNewItem] = useState("");
    const addItem = () => {
        if (!newItem.trim()) return;
        onChange([...data, newItem.trim()]);
        setNewItem("");
    };
    return (
        <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
            <div className="space-y-2">
                {data.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <ListPlus className="text-gray-400 shrink-0 mx-1" size={14} />
                        <span className="flex-1 text-sm text-gray-700">{item}</span>
                        <button onClick={() => onChange(data.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem()} placeholder={placeholder} className="flex-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#a60303]" />
                <button onClick={addItem} className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-200">Add</button>
            </div>
        </div>
    );
}

function LessonAdder({ onAdd }: { onAdd: (title: string) => void }) {
    const [title, setTitle] = useState("");
    const handleAdd = () => {
        if (!title.trim()) return;
        onAdd(title);
        setTitle("");
    };
    return (
        <div className="flex gap-2 mt-2">
            <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Add lesson (e.g. Intro to React)..." 
                className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-[#a60303]"
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdd();
                    }
                }}
            />
            <button 
                onClick={handleAdd} 
                className="p-1.5 bg-gray-100 text-gray-700 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors"
                title="Add Lesson"
            >
                <Plus size={16} />
            </button>
        </div>
    );
}

function CurriculumBuilder({ data, onChange }: { data: { title: string; lessons: string[] }[], onChange: (arr: { title: string; lessons: string[] }[]) => void }) {
    const [newSection, setNewSection] = useState("");

    const addSection = () => {
        if (!newSection.trim()) return;
        onChange([...data, { title: newSection.trim(), lessons: [] }]);
        setNewSection("");
    };

    const removeSection = (idx: number) => {
        onChange(data.filter((_, i) => i !== idx));
    };

    const addLesson = (sectionIdx: number, title: string) => {
        if (!title.trim()) return;
        const newData = data.map((section, idx) => {
            if (idx === sectionIdx) {
                return { ...section, lessons: [...section.lessons, title.trim()] };
            }
            return section;
        });
        onChange(newData);
    };

    const removeLesson = (sectionIdx: number, lessonIdx: number) => {
        const newData = data.map((section, idx) => {
            if (idx === sectionIdx) {
                return { ...section, lessons: section.lessons.filter((_, i) => i !== lessonIdx) };
            }
            return section;
        });
        onChange(newData);
    };

    return (
        <div className="space-y-4">
            
            <div className="space-y-4">
                {data.map((sectionItem, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3">
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200">
                            <span className="font-bold text-sm text-gray-800 flex-1 px-2">{sectionItem.title}</span>
                            <button onClick={() => removeSection(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                        </div>
                        
                        <div className="pl-6 space-y-2">
                            {sectionItem.lessons.map((lesson, lIdx) => (
                                <div key={lIdx} className="flex justify-between items-center text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">
                                    <div className="flex-1 flex gap-2 items-center">
                                        <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                        <span>{lesson}</span>
                                    </div>
                                    <button onClick={() => removeLesson(idx, lIdx)} className="text-red-400 hover:text-red-600 px-1"><X size={14} /></button>
                                </div>
                            ))}
                            <LessonAdder onAdd={(title) => addLesson(idx, title)} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newSection} 
                    onChange={e => setNewSection(e.target.value)} 
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addSection();
                        }
                    }} 
                    placeholder="New Section Title (e.g. Section 01)..." 
                    className="flex-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#a60303]" 
                />
                <button onClick={addSection} className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-200 whitespace-nowrap">Add Section</button>
            </div>
        </div>
    );
}

function FAQBuilder({ data, onChange }: { data: { question: string; answer: string }[], onChange: (arr: { question: string; answer: string }[]) => void }) {
    const [q, setQ] = useState("");
    const [a, setA] = useState("");

    const addFaq = () => {
        if (!q.trim() || !a.trim()) return;
        onChange([...data, { question: q.trim(), answer: a.trim() }]);
        setQ("");
        setA("");
    };

    const removeFaq = (idx: number) => {
        onChange(data.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Frequently Asked Questions</label>
            
            <div className="space-y-3">
                {data.map((faq, idx) => (
                    <div key={idx} className="p-3 border border-gray-200 rounded-xl bg-gray-50 flex gap-3 items-start">
                        <div className="flex-1 space-y-1">
                            <p className="font-bold text-sm text-gray-800">Q: {faq.question}</p>
                            <p className="text-sm text-gray-600">A: {faq.answer}</p>
                        </div>
                        <button onClick={() => removeFaq(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                ))}
            </div>

            <div className="space-y-2 border border-gray-200 p-3 rounded-xl bg-white">
                <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Question..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#a60303]" />
                <textarea value={a} onChange={e => setA(e.target.value)} placeholder="Answer..." rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#a60303] resize-none" />
                <button onClick={addFaq} className="w-full py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-200">Add FAQ</button>
            </div>
        </div>
    );
}

function BatchBuilder({ data, onChange }: { data: any[], onChange: (arr: any[]) => void }) {
    const defaultBatch = {
        start_date: "",
        mode: "Classroom & Online",
        classes: ["Weekdays (5 Days)"],
        duration_hours: 8,
        batch_dates: [],
        locations: []
    };

    const addBatch = () => {
        onChange([...data, { ...defaultBatch }]);
    };

    const removeBatch = (idx: number) => {
        onChange(data.filter((_, i) => i !== idx));
    };

    const updateBatch = (idx: number, field: string, value: any) => {
        const newData = [...data];
        newData[idx] = { ...newData[idx], [field]: value };
        onChange(newData);
    };

    const handleCheckbox = (idx: number, opt: string) => {
        const current = data[idx].classes || [];
        if (current.includes(opt)) {
            updateBatch(idx, "classes", current.filter((c: string) => c !== opt));
        } else {
            updateBatch(idx, "classes", [...current, opt]);
        }
    };

    return (
        <div className="space-y-6">
            {data.map((batch, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-5">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <span className="font-bold text-sm text-gray-800">Batch #{idx + 1}</span>
                        <button onClick={() => removeBatch(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date (Hero display)</label>
                            <input type="date" value={batch.start_date || ""} onChange={e => updateBatch(idx, "start_date", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-red-100 focus:border-[#a60303] outline-none text-sm" />
                        </div>
                        <div className="space-y-1.5 flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Time Duration (hrs per day)</label>
                            <input type="number" value={batch.duration_hours || ""} onChange={e => updateBatch(idx, "duration_hours", parseFloat(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-red-100 focus:border-[#a60303] outline-none text-sm" placeholder="e.g. 8" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Mode of Training</label>
                        <div className="flex flex-wrap gap-4">
                            {["Classroom", "Online", "Classroom & Online"].map(opt => (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" checked={batch.mode === opt} onChange={() => updateBatch(idx, "mode", opt)} className="w-4 h-4 text-[#a60303]" />
                                    <span className="text-sm text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Classes Schedule (Multiselect)</label>
                        <div className="flex flex-wrap gap-4">
                            {["Weekdays (5 Days)", "Weekend Classes"].map(opt => (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={(batch.classes || []).includes(opt)} onChange={() => handleCheckbox(idx, opt)} className="w-4 h-4 text-[#a60303] rounded" />
                                    <span className="text-sm text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                        <ArrayBuilder 
                            label="Batch Schedule Dates (Calendar selection alternative)" 
                            data={batch.batch_dates || []} 
                            onChange={arr => updateBatch(idx, "batch_dates", arr)} 
                            placeholder="e.g. 2026-04-11, APR 12 & 18..." 
                        />
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                        <ArrayBuilder 
                            label="Locations (Cities)" 
                            data={batch.locations || []} 
                            onChange={arr => updateBatch(idx, "locations", arr)} 
                            placeholder="e.g. Chennai, Bangalore" 
                        />
                    </div>
                </div>
            ))}

            <button onClick={addBatch} className="w-full py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-200 flex justify-center items-center gap-2">
                <Plus size={16} /> Add Training Batch
            </button>
        </div>
    );
}

// ── VideoBuilder ────────────────────────────────────────────────

function VideoBuilder({ data, onChange }: { data: { title: string; url: string }[], onChange: (arr: { title: string; url: string }[]) => void }) {
    const [newTitle, setNewTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");

    const base = "px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-red-100 focus:border-[#a60303] outline-none text-sm w-full";

    const getYouTubeId = (url: string) => {
        const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
    };

    const addVideo = () => {
        const url = newUrl.trim();
        const title = newTitle.trim();
        if (!url) return;
        const id = getYouTubeId(url);
        if (!id) return;
        onChange([...data, { title: title || `Video ${data.length + 1}`, url }]);
        setNewTitle("");
        setNewUrl("");
    };

    const updateVideo = (idx: number, field: "title" | "url", val: string) => {
        const next = [...data];
        next[idx] = { ...next[idx], [field]: val };
        onChange(next);
    };

    const removeVideo = (idx: number) => onChange(data.filter((_, i) => i !== idx));

    const getYouTubeId2 = getYouTubeId;

    return (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-400">Paste any YouTube URL (watch, short, embed). The video will be embedded on the course page.</p>

            {/* Existing videos */}
            {data.map((v, idx) => {
                const thumbId = getYouTubeId2(v.url);
                return (
                    <div key={idx} className="flex gap-3 items-start bg-gray-50 rounded-xl border border-gray-200 p-3">
                        {thumbId && (
                            <img
                                src={`https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`}
                                alt=""
                                className="w-28 h-16 rounded-lg object-cover shrink-0 border border-gray-200"
                            />
                        )}
                        <div className="flex-1 flex flex-col gap-2 min-w-0">
                            <input
                                type="text"
                                value={v.title}
                                onChange={e => updateVideo(idx, "title", e.target.value)}
                                placeholder="Video title"
                                className={base}
                            />
                            <input
                                type="text"
                                value={v.url}
                                onChange={e => updateVideo(idx, "url", e.target.value)}
                                placeholder="YouTube URL"
                                className={base}
                            />
                        </div>
                        <button onClick={() => removeVideo(idx)} className="text-red-400 hover:text-red-600 p-1 mt-1 shrink-0">
                            <X size={16} />
                        </button>
                    </div>
                );
            })}

            {/* Add new */}
            <div className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col gap-2 bg-white">
                <div className="flex items-center gap-2 mb-1">
                    <Youtube size={16} className="text-red-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Add Video</span>
                </div>
                <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Video title (optional)"
                    className={base}
                />
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newUrl}
                        onChange={e => setNewUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addVideo(); } }}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className={base}
                    />
                    <button
                        type="button"
                        onClick={addVideo}
                        className="px-4 py-2 bg-[#a60303] text-white text-sm font-bold rounded-lg hover:bg-[#800202] whitespace-nowrap shrink-0"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
