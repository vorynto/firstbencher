"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, ArrowLeft, Loader2, ListPlus, X, CheckCircle2, ChevronDown, ToggleLeft, ToggleRight, UserCircle2, Youtube, CheckCircle, AlertCircle, Target, TrendingUp } from "lucide-react";
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
    partner_logo_url: string;
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
    section_bg_color?: string | null;
};

const defaultTabsEnabled = {
    overview: true, training_dates: true, key_features: true,
    curriculum: true, eligibility: true, faq: true, instructors: true, videos: true,
};

const defaultCourse: Partial<Course> = {
    title: "", slug: "", description: "", short_description: "",
    image_url: "", partner_logo_url: "", price: 0, duration: "", category: "Project Management",
    active: true, tags: [], rating: 5.0, features: [], requirements: "", popular_order: 0,
    card_inner_text: "", review_count: 0, instructor_ids: [],
    curriculum: [], faq: [], batches: [], videos: [],
    tabs_enabled: { ...defaultTabsEnabled },
    section_bg_color: null,
};

// ── SEO ──────────────────────────────────────────────────────────
type CourseSeoData = {
    seoTitle: string;
    metaDescription: string;
    focusKeyword: string;
    supportingKeywords: string[];
};

const defaultCourseSeo: CourseSeoData = { seoTitle: "", metaDescription: "", focusKeyword: "", supportingKeywords: [] };

type SeoCheck = { pass: boolean; label: string; points: number; suggestion?: string };

function computeCourseSeoScore(
    seo: CourseSeoData,
    ctx: { title: string; slug: string; description: string; shortDescription: string }
): { score: number; checks: SeoCheck[] } {
    const title = (seo.seoTitle || ctx.title || "").trim();
    const desc = (seo.metaDescription || ctx.shortDescription || "").trim();
    const kw = (seo.focusKeyword || "").trim().toLowerCase();
    const slug = (ctx.slug || "").trim().toLowerCase();
    const kwSlug = kw.replace(/\s+/g, "-");
    const contentText = (ctx.description || "").replace(/<[^>]+>/g, " ").toLowerCase();
    const wordCount = contentText.split(/\s+/).filter(Boolean).length;
    const supporting = seo.supportingKeywords || [];
    const checks: SeoCheck[] = [];
    let score = 0;

    const add = (pass: boolean, label: string, points: number, suggestion?: string) => {
        if (pass) score += points;
        checks.push({ pass, label, points, suggestion });
    };

    add(title.length > 0, "SEO title is set", 5, "Add an SEO title to override the course title in search results");
    add(desc.length > 0, "Meta description is set", 5, "Write a compelling meta description");
    add(kw.length > 0, "Focus keyword is set", 5, "Enter the main keyword you want to rank for");

    if (kw) {
        add(title.toLowerCase().includes(kw), `Focus keyword in SEO title`, 15, `Add "${kw}" to your SEO title`);
        add(title.toLowerCase().startsWith(kw), `Focus keyword at start of SEO title`, 10, `Move "${kw}" to the beginning of your SEO title`);
        add(desc.toLowerCase().includes(kw), `Focus keyword in meta description`, 15, `Include "${kw}" naturally in your meta description`);
        add(slug.includes(kwSlug), `Focus keyword in URL slug`, 10, `Add "${kwSlug}" to the URL slug`);
        add(contentText.includes(kw), `Focus keyword used in description`, 5, `Use "${kw}" naturally in your course description`);
    } else {
        checks.push({ pass: false, label: "Focus keyword in SEO title (+15)", points: 15, suggestion: "Set a focus keyword first" });
        checks.push({ pass: false, label: "Focus keyword at start of title (+10)", points: 10, suggestion: "Set a focus keyword first" });
        checks.push({ pass: false, label: "Focus keyword in meta description (+15)", points: 15, suggestion: "Set a focus keyword first" });
        checks.push({ pass: false, label: "Focus keyword in URL slug (+10)", points: 10, suggestion: "Set a focus keyword first" });
        checks.push({ pass: false, label: "Focus keyword in description (+5)", points: 5, suggestion: "Set a focus keyword first" });
    }

    add(title.length >= 50 && title.length <= 60, `SEO title length 50-60 chars (${title.length})`, 10,
        title.length < 50 ? `Add ${50 - title.length} more characters` : `Remove ${title.length - 60} characters`);
    add(desc.length >= 120 && desc.length <= 160, `Meta description 120-160 chars (${desc.length})`, 10,
        desc.length < 120 ? `Add ${120 - desc.length} more characters` : `Remove ${desc.length - 160} characters`);
    add(supporting.length >= 2, `Supporting keywords added (${supporting.length}/2 min)`, 10, "Add at least 2 supporting keywords");
    add(wordCount >= 200, `Description length ≥ 200 words (${wordCount})`, 5, "Write at least 200 words for better rankings");

    return { score, checks };
}

export default function CoursesPage() {
    const supabase = useMemo(() => createClient(), []);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"list" | "form" | "tags">("list");
    const [editorData, setEditorData] = useState<Partial<Course>>(defaultCourse);
    const [seoData, setSeoData] = useState<CourseSeoData>(defaultCourseSeo);
    const [newKw, setNewKw] = useState("");
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

    const handleEdit = async (course: Course) => {
        setEditorData({ ...course, instructor_ids: course.instructor_ids || [] });
        const { data } = await supabase
            .from("pages_content")
            .select("content")
            .eq("page_name", `seo:course:${course.id}`)
            .maybeSingle();
        setSeoData(data?.content ? { ...defaultCourseSeo, ...(data.content as Partial<CourseSeoData>) } : defaultCourseSeo);
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
            section_bg_color: editorData.section_bg_color || null,
        };

        let err;
        let savedId = editorData.id;

        if (editorData.id) {
            const { error } = await supabase.from("courses").update(payload).match({ id: editorData.id });
            err = error;
        } else {
            const { data: inserted, error } = await supabase.from("courses").insert([payload]).select("id").single();
            err = error;
            if (!err && inserted) savedId = inserted.id;
        }

        if (!err && savedId) {
            await supabase.from("pages_content").upsert(
                { page_name: `seo:course:${savedId}`, content: seoData, updated_at: new Date().toISOString() },
                { onConflict: "page_name" }
            );
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
                <div className={cn("fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-bold", toast.type === "success" ? "bg-green-500" : "bg-primary-tint0")}>
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
                        <button onClick={() => { setEditorData(defaultCourse); setSeoData(defaultCourseSeo); setView("form"); }} className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--primary-dark)] transition-colors shadow-sm text-sm">
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
                        <input type="text" placeholder="Search by title or slug..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                                                        {course.tags?.map(t => <span key={t} className="text-[10px] font-bold text-[var(--primary)] bg-primary-tint px-1.5 py-0.5 rounded uppercase tracking-wider">{t}</span>)}
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
                                            <button onClick={() => handleEdit(course)} className="p-2 text-gray-400 hover:text-[var(--primary)] transition-colors"><Edit2 size={18} /></button>
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
                    seoData={seoData}
                    setSeoData={setSeoData}
                    newKw={newKw}
                    setNewKw={setNewKw}
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
                    }} disabled={saving} className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary-dark)] mt-4">
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
        <div className={cn("bg-white rounded-2xl border transition-all", isOpen ? "border-[var(--primary)]/30 shadow-sm" : "border-gray-200")}>
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
    seoData, setSeoData, newKw, setNewKw,
}: {
    editorData: Partial<Course>;
    setEditorData: (d: Partial<Course>) => void;
    predefinedTags: string[];
    allInstructors: Instructor[];
    saving: boolean;
    saveCourse: () => void;
    seoData: CourseSeoData;
    setSeoData: React.Dispatch<React.SetStateAction<CourseSeoData>>;
    newKw: string;
    setNewKw: (v: string) => void;
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
                        <p className="text-sm text-gray-500 italic">No instructors found. <a href="/admin/instructors" className="text-[var(--primary)] font-bold underline">Add instructors first →</a></p>
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
                                                ? "border-[var(--primary)] bg-primary-tint shadow-sm"
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
                                            <p className={cn("font-bold text-sm truncate", selected ? "text-[var(--primary)]" : "text-gray-800")}>{inst.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{inst.qualification || inst.experience || "—"}</p>
                                        </div>
                                        {selected && <CheckCircle2 size={16} className="text-[var(--primary)] shrink-0" />}
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
                            <input type="checkbox" checked={editorData.active ?? true} onChange={e => setEditorData({ ...editorData, active: e.target.checked })} className="w-4 h-4 rounded text-[var(--primary)]" />
                            <span className="text-sm font-bold text-gray-700">Published</span>
                        </label>
                    </div>
                    <button onClick={saveCourse} disabled={saving} className="w-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50">
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
                    <ImageUploadField
                        label="Accreditation / Partner Logo (shown in trust bar)"
                        value={editorData.partner_logo_url || ""}
                        onChange={v => setEditorData({ ...editorData, partner_logo_url: v })}
                    />
                    <p className="text-xs text-gray-400 -mt-2">Optional. Defaults to the PMI Authorized Training Partner badge if left empty.</p>
                </section>

                {/* Page Background Color */}
                <section className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-4">
                    <h2 className="text-base font-bold border-b border-gray-100 pb-2">Page Background Color</h2>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={!!editorData.section_bg_color}
                            onChange={e => setEditorData({
                                ...editorData,
                                section_bg_color: e.target.checked ? "#4f46e5" : null,
                            })}
                            className="w-4 h-4 rounded accent-[var(--primary)]"
                        />
                        <span className="text-sm font-semibold text-gray-700">Enable custom background</span>
                    </label>
                    {editorData.section_bg_color && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={editorData.section_bg_color}
                                    onChange={e => setEditorData({ ...editorData, section_bg_color: e.target.value })}
                                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                                />
                                <span className="text-sm font-mono text-gray-600">{editorData.section_bg_color}</span>
                            </div>
                            {/* Preview swatch */}
                            <div
                                className="h-10 rounded-xl border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500"
                                style={{ backgroundColor: editorData.section_bg_color + "18" }}
                            >
                                Preview (mild tint)
                            </div>
                            <p className="text-[10px] text-gray-400 italic leading-snug">
                                A light tint (~10% opacity) of the selected color will be used as the course page background.
                            </p>
                        </div>
                    )}
                </section>

                <section className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col gap-5">
                    <h2 className="text-base font-bold border-b border-gray-100 pb-2">Details</h2>
                    <Field label="Duration" value={editorData.duration || ""} onChange={v => setEditorData({ ...editorData, duration: v })} placeholder="e.g. 5 Weeks" />
                    <Field label="Category" value={editorData.category || ""} onChange={v => setEditorData({ ...editorData, category: v })} />
                    <Field label="Rating (1–5)" type="number" value={editorData.rating?.toString() || "5"} onChange={v => setEditorData({ ...editorData, rating: parseFloat(v) })} />
                    <Field label="Enrolled Students Count" type="number" value={editorData.review_count?.toString() || "0"} onChange={v => setEditorData({ ...editorData, review_count: parseInt(v) })} placeholder="e.g. 12500" />
                    <p className="text-[10px] text-gray-400 italic -mt-3">Shown in the hero trust bar as &quot;X+ Students Enrolled &amp; Rated&quot;.</p>
                </section>

                {/* ── SEO Panel ── */}
                <CourseSeoPanel
                    seoData={seoData}
                    setSeoData={setSeoData}
                    newKw={newKw}
                    setNewKw={setNewKw}
                    courseTitle={editorData.title || ""}
                    courseSlug={editorData.slug || ""}
                    courseDescription={editorData.description || ""}
                    courseShortDescription={editorData.short_description || ""}
                />

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
                                        className={cn("px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors cursor-pointer", isSelected ? "bg-primary-tint border-red-200 text-[var(--primary)]" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100")}
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
    const base = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none text-sm";
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
                <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem()} placeholder={placeholder} className="flex-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[var(--primary)]" />
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
                className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-[var(--primary)]"
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
                    className="flex-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[var(--primary)]" 
                />
                <button onClick={addSection} className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-200 whitespace-nowrap">Add Section</button>
            </div>
        </div>
    );
}

function FAQBuilder({ data, onChange }: { data: { question: string; answer: string }[], onChange: (arr: { question: string; answer: string }[]) => void }) {
    const addFaq = () => {
        onChange([...data, { question: "", answer: "" }]);
    };

    const removeFaq = (idx: number) => {
        onChange(data.filter((_, i) => i !== idx));
    };

    const updateFaq = (idx: number, field: "question" | "answer", value: string) => {
        const next = [...data];
        next[idx] = { ...next[idx], [field]: value };
        onChange(next);
    };

    return (
        <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Frequently Asked Questions</label>

            <div className="space-y-4">
                {data.map((faq, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Question {idx + 1}</span>
                            <button onClick={() => removeFaq(idx)} className="text-red-400 hover:text-red-600 p-1 shrink-0"><Trash2 size={16} /></button>
                        </div>
                        <input
                            type="text"
                            value={faq.question}
                            onChange={e => updateFaq(idx, "question", e.target.value)}
                            placeholder="Question..."
                            className="w-full px-3 py-2 text-sm font-semibold border border-gray-200 rounded-lg outline-none focus:border-[var(--primary)] bg-white"
                        />
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 mb-1.5">Answer — use the toolbar for bullet points, lists & formatting</p>
                            <TipTapEditor
                                value={faq.answer || ""}
                                onChange={v => updateFaq(idx, "answer", v)}
                                placeholder="Type the answer. Use bullet/numbered lists for steps, and emojis (✅ ⭐ 👉) for icon bullets…"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={addFaq} className="w-full py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-200">+ Add FAQ</button>
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
                            <input type="date" value={batch.start_date || ""} onChange={e => updateBatch(idx, "start_date", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none text-sm" />
                        </div>
                        <div className="space-y-1.5 flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Time Duration (hrs per day)</label>
                            <input type="number" value={batch.duration_hours || ""} onChange={e => updateBatch(idx, "duration_hours", parseFloat(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none text-sm" placeholder="e.g. 8" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Mode of Training</label>
                        <div className="flex flex-wrap gap-4">
                            {["Classroom", "Online", "Classroom & Online"].map(opt => (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" checked={batch.mode === opt} onChange={() => updateBatch(idx, "mode", opt)} className="w-4 h-4 text-[var(--primary)]" />
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
                                    <input type="checkbox" checked={(batch.classes || []).includes(opt)} onChange={() => handleCheckbox(idx, opt)} className="w-4 h-4 text-[var(--primary)] rounded" />
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

    const base = "px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none text-sm w-full";

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
                        className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-bold rounded-lg hover:bg-[var(--primary-dark)] whitespace-nowrap shrink-0"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── CourseSeoPanel ──────────────────────────────────────────────

function CourseSeoPanel({
    seoData, setSeoData, newKw, setNewKw,
    courseTitle, courseSlug, courseDescription, courseShortDescription,
}: {
    seoData: CourseSeoData;
    setSeoData: React.Dispatch<React.SetStateAction<CourseSeoData>>;
    newKw: string;
    setNewKw: (v: string) => void;
    courseTitle: string;
    courseSlug: string;
    courseDescription: string;
    courseShortDescription: string;
}) {
    const { score, checks } = computeCourseSeoScore(seoData, {
        title: courseTitle,
        slug: courseSlug,
        description: courseDescription,
        shortDescription: courseShortDescription,
    });
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
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
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
                        <div key={i} className={cn("flex items-start gap-2 p-2 rounded-lg text-xs", chk.pass ? "bg-green-50" : "bg-red-50")}>
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
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
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
                        placeholder="e.g. pmp certification online"
                        className={inputCls}
                    />
                </div>

                {/* Supporting Keywords */}
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Supporting Keywords</label>
                    {seoData.supportingKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {seoData.supportingKeywords.map(kw => (
                                <span key={kw} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-[var(--primary)] rounded-lg text-xs font-semibold">
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
