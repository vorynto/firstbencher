"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Save, RotateCcw, ChevronRight, Layout,
    CheckCircle, AlertCircle, Plus, Trash2,
    Home, Info, Phone, Globe, Settings, GripVertical,
    ArrowLeft, Search, ExternalLink, X, Target, TrendingUp
} from "lucide-react";
import { Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import ImageUploadField from "@/components/admin/ImageUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";

// ── Types ──────────────────────────────────────────────────────
type ContentMap = Record<string, unknown>;

// ── Page / Section manifest ────────────────────────────────────
// ── Page / Section manifest ────────────────────────────────────
const BASE_PAGES = [
    {
        id: "home", name: "Home Page", slug: "/", icon: Home,
        sections: [
            { id: "home_hero", name: "Hero Section" },
            { id: "home_about", name: "About Us Section" },
            { id: "home_stats_cta", name: "Stats CTA Section (Red)" },
            { id: "home_stats", name: "Stats Bar" },
            { id: "home_categories", name: "Category Grid" },
            { id: "home_why_us", name: "Why Choose Us" },
            { id: "home_cta", name: "CTA Banner" },
        ],
    },
    {
        id: "about", name: "About Us", slug: "/about", icon: Info,
        sections: [
            { id: "about_intro", name: "About Us Narrative" },
            { id: "about_vision", name: "Mission & Vision" },
            { id: "about_values", name: "Core Values" },
            { id: "about_team", name: "Team" },
        ],
    },
    {
        id: "contact", name: "Contact Page", slug: "/contact", icon: Phone,
        sections: [
            { id: "contact_header", name: "Header Info" },
            { id: "contact_details", name: "Contact Details" },
        ],
    },
];

// ── Utility ────────────────────────────────────────────────────
function Field({
    label, value, onChange, type = "text", placeholder = "", rows = 3,
}: {
    label: string; value: string; onChange: (v: string) => void;
    type?: "text" | "textarea" | "url" | "color"; placeholder?: string; rows?: number;
}) {
    const base = "w-full p-3 rounded-xl border border-border bg-accent/20 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm";
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
            {type === "textarea" ? (
                <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} className={`${base} resize-none`} />
            ) : type === "color" ? (
                <div className="flex items-center gap-3">
                    <input type="color" value={value || "#a60303"} onChange={e => onChange(e.target.value)}
                        className="w-12 h-10 rounded-lg border border-border cursor-pointer" />
                    <input type="text" value={value} onChange={e => onChange(e.target.value)}
                        placeholder="#a60303" className={`${base} flex-1`} />
                </div>
            ) : (
                <input type={type} value={value} onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} className={base} />
            )}
        </div>
    );
}

// ── Section editors ────────────────────────────────────────────

function HomeHeroEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const s = (k: string) => (content[k] as string) ?? "";
    const u = (k: string, v: string) => onChange({ ...content, [k]: v });
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Badge Text" value={s("badge")} onChange={v => u("badge", v)} placeholder="💡 Our Online Training" />
            <Field label="Headline — Line 1" value={s("title_line1")} onChange={v => u("title_line1", v)} placeholder="Our Expert Training" />
            <Field label="Headline — Line 2" value={s("title_line2")} onChange={v => u("title_line2", v)} placeholder="Will Grow Your" />
            <Field label="Headline — Highlighted Word" value={s("title_highlight")} onChange={v => u("title_highlight", v)} placeholder="Career" />
            <div className="md:col-span-2">
                <RichTextEditor label="Description" value={s("description")} onChange={v => u("description", v)} />
            </div>
            <Field label="CTA Button Text" value={s("cta_primary_text")} onChange={v => u("cta_primary_text", v)} placeholder="Enroll Now" />
            <Field label="CTA Button Link" value={s("cta_primary_href")} onChange={v => u("cta_primary_href", v)} placeholder="/courses" />
            <Field label="Stat 1 — Value" value={s("stat1_value")} onChange={v => u("stat1_value", v)} placeholder="2,000+" />
            <Field label="Stat 1 — Label" value={s("stat1_label")} onChange={v => u("stat1_label", v)} placeholder="Success Students" />
            <Field label="Stat 2 — Value" value={s("stat2_value")} onChange={v => u("stat2_value", v)} placeholder="405+" />
            <Field label="Stat 2 — Label" value={s("stat2_label")} onChange={v => u("stat2_label", v)} placeholder="Expert Courses" />
            <div className="md:col-span-2">
                <ImageUploadField label="Hero Image Upload (Boy)" value={s("hero_image_url")} onChange={v => u("hero_image_url", v)} />
            </div>
            
            <p className="md:col-span-2 text-xs font-black uppercase tracking-widest text-muted-foreground mt-4 border-b border-border pb-2">Floating Decorative Elements</p>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 bg-accent/10 p-4 rounded-2xl border border-border">
                <ImageUploadField label="Success Student Avatar 1" value={s("student_avatar_1")} onChange={v => u("student_avatar_1", v)} />
                <ImageUploadField label="Success Student Avatar 2" value={s("student_avatar_2")} onChange={v => u("student_avatar_2", v)} />
                <ImageUploadField label="Reviewer Avatar (Udemy card)" value={s("reviewer_avatar")} onChange={v => u("reviewer_avatar", v)} />
                <ImageUploadField label="Clock Icon (Bottom Left)" value={s("clock_icon")} onChange={v => u("clock_icon", v)} />
                <ImageUploadField label="Thumbs Up Icon (Bottom Right)" value={s("thumbs_up_icon")} onChange={v => u("thumbs_up_icon", v)} />
            </div>
            <div className="md:col-span-2">
                <Field label="Popular Tags (comma-separated)" value={s("popular_categories")} onChange={v => u("popular_categories", v)} placeholder="Accounting,Business,Development" />
            </div>

            <p className="md:col-span-2 text-xs font-black uppercase tracking-widest text-muted-foreground mt-6 border-b border-border pb-2">Corporate Clients Logos</p>
            <div className="md:col-span-2 space-y-4">
                {((content.corporate_clients as Array<any>) || []).map((client, idx) => (
                    <div key={client._id || idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-accent/5 rounded-2xl border border-border/50 relative group">
                        <div className="md:col-span-4">
                            <Field label="Client Name" value={client.name} onChange={v => {
                                const next = [...((content.corporate_clients as Array<any>) || [])];
                                next[idx] = { ...next[idx], name: v };
                                onChange({ ...content, corporate_clients: next });
                            }} placeholder="Company Name" />
                        </div>
                        <div className="md:col-span-7">
                            <ImageUploadField label="Logo Image" value={client.logo_url} onChange={v => {
                                const next = [...((content.corporate_clients as Array<any>) || [])];
                                next[idx] = { ...next[idx], logo_url: v };
                                onChange({ ...content, corporate_clients: next });
                            }} />
                        </div>
                        <div className="md:col-span-1 flex justify-end pb-2">
                            <button 
                                onClick={() => {
                                    const next = ((content.corporate_clients as Array<any>) || []).filter((_, i) => i !== idx);
                                    onChange({ ...content, corporate_clients: next });
                                }}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                <button 
                    onClick={() => {
                        const next = [...((content.corporate_clients as Array<any>) || []), { name: "", logo_url: "", _id: Math.random().toString(36).slice(2) }];
                        onChange({ ...content, corporate_clients: next });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-2xl text-sm font-bold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                >
                    <Plus size={18} /> Add Corporate Client
                </button>
            </div>
        </div>
    );
}

function AboutSectionEditor({ content, onChange, isHomePage = false }: { content: ContentMap; onChange: (c: ContentMap) => void; isHomePage?: boolean }) {
    const s = (k: string) => (content[k] as string) ?? "";
    const u = (k: string, v: string) => onChange({ ...content, [k]: v });
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {isHomePage && <Field label="Badge Text" value={s("badge_text")} onChange={v => u("badge_text", v)} placeholder="About Us" />}
            <Field label="Main Title" value={s("title")} onChange={v => u("title", v)} placeholder="Our Story: Built On Values..." />
            <div className="md:col-span-2">
                <RichTextEditor label="Description" value={s("description")} onChange={v => u("description", v)} />
            </div>
            
            {isHomePage && (
                <>
                    <p className="md:col-span-2 text-xs font-black uppercase tracking-widest text-muted-foreground mt-4 border-b border-border pb-2">Mission & Vision</p>
                    <Field label="Mission Title" value={s("mission_title")} onChange={v => u("mission_title", v)} />
                    <Field label="Mission Description" value={s("mission_description")} onChange={v => u("mission_description", v)} type="textarea" rows={2} />
                    <Field label="Vision Title" value={s("vision_title")} onChange={v => u("vision_title", v)} />
                    <Field label="Vision Description" value={s("vision_description")} onChange={v => u("vision_description", v)} type="textarea" rows={2} />
                </>
            )}

            <p className="md:col-span-2 text-xs font-black uppercase tracking-widest text-muted-foreground mt-4 border-b border-border pb-2">Badges & Metrics</p>
            <Field label="Exp. Years (e.g. 25+)" value={s("exp_years")} onChange={v => u("exp_years", v)} />
            <Field label="Exp. Label" value={s("exp_label")} onChange={v => u("exp_label", v)} />
            <Field label="Awards Count" value={s("awards_count")} onChange={v => u("awards_count", v)} />
            <Field label="Awards Label" value={s("awards_label")} onChange={v => u("awards_label", v)} />

            {isHomePage && (
                <>
                    <p className="md:col-span-2 text-xs font-black uppercase tracking-widest text-muted-foreground mt-4 border-b border-border pb-2">Call to Action</p>
                    <Field label="CTA Button Text" value={s("cta_text")} onChange={v => u("cta_text", v)} />
                    <Field label="CTA Button Link" value={s("cta_href")} onChange={v => u("cta_href", v)} />
                </>
            )}

            <p className="md:col-span-2 text-xs font-black uppercase tracking-widest text-muted-foreground mt-4 border-b border-border pb-2">Media</p>
            <ImageUploadField label="Image 1 (Left/Top)" value={s("image1_url")} onChange={v => u("image1_url", v)} />
            <ImageUploadField label="Image 2 (Right/Bottom)" value={s("image2_url")} onChange={v => u("image2_url", v)} />
        </div>
    );
}

function HomeStatsCTAEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const s = (k: string) => (content[k] as string) ?? "";
    const u = (k: string, v: string) => onChange({ ...content, [k]: v });
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Stat 1 Number" value={s("stat1_number")} onChange={v => u("stat1_number", v)} placeholder="10k" />
            <Field label="Stat 1 Label" value={s("stat1_label")} onChange={v => u("stat1_label", v)} placeholder="Student Trained" />
            
            <Field label="Stat 2 Number" value={s("stat2_number")} onChange={v => u("stat2_number", v)} placeholder="50+" />
            <Field label="Stat 2 Label" value={s("stat2_label")} onChange={v => u("stat2_label", v)} placeholder="Recorded Courses" />
            
            <Field label="Stat 3 Number" value={s("stat3_number")} onChange={v => u("stat3_number", v)} placeholder="15M" />
            <Field label="Stat 3 Label" value={s("stat3_label")} onChange={v => u("stat3_label", v)} placeholder="Satisfaction Rate" />

            <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-5 gap-5">
                <Field label="Background Color" value={s("bg_color")} onChange={v => u("bg_color", v)} type="color" />
                <Field label="Stat Label Color" value={s("stat_label_color")} onChange={v => u("stat_label_color", v)} type="color" />
                <Field label="Stat Number Stroke" value={s("stat_stroke_color")} onChange={v => u("stat_stroke_color", v)} type="color" />
                <Field label="Vertical Padding (px)" value={s("padding_y")} onChange={v => u("padding_y", v)} placeholder="80" />
                <Field label="Image Height (px)" value={s("image_height")} onChange={v => u("image_height", v)} placeholder="450" />
            </div>

            <div className="md:col-span-2 p-4 bg-accent/10 rounded-2xl border border-border">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Media Content</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ImageUploadField label="Featured Image" value={s("image_url")} onChange={v => u("image_url", v)} />
                    <Field label="Video URL (Play button action)" value={s("video_url")} onChange={v => u("video_url", v)} type="url" placeholder="https://youtube.com/..." />
                </div>
            </div>
        </div>
    );
}

function HomeStatsEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const pairs = [1, 2, 3, 4];
    const s = (k: string) => (content[k] as string) ?? "";
    const u = (k: string, v: string) => onChange({ ...content, [k]: v });
    return (
        <div className="flex flex-col gap-6">
            {pairs.map(i => (
                <div key={i} className="p-4 bg-accent/20 rounded-2xl border border-border">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Stat Card {i}</p>
                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Icon (emoji)" value={s(`stat${i}_icon`)} onChange={v => u(`stat${i}_icon`, v)} placeholder="👨‍🎓" />
                        <Field label="Value" value={s(`stat${i}_value`)} onChange={v => u(`stat${i}_value`, v)} placeholder="10,000+" />
                        <Field label="Label" value={s(`stat${i}_label`)} onChange={v => u(`stat${i}_label`, v)} placeholder="Students Trained" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function CategoryGridEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const cats = (content.categories as Array<{ name: string; emoji: string; count: number; href: string }>) ?? [];
    const update = (idx: number, key: string, val: string | number) => {
        const next = cats.map((c, i) => i === idx ? { ...c, [key]: val } : c);
        onChange({ ...content, categories: next });
    };
    const add = () => onChange({ ...content, categories: [...cats, { name: "", emoji: "📋", count: 0, href: "" }] });
    const remove = (idx: number) => onChange({ ...content, categories: cats.filter((_, i) => i !== idx) });

    return (
        <div className="flex flex-col gap-4">
            {cats.map((cat, idx) => (
                <div key={idx} className="p-4 bg-accent/20 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Category {idx + 1}</p>
                        <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Name" value={cat.name} onChange={v => update(idx, "name", v)} placeholder="Project Management" />
                        <Field label="Emoji" value={cat.emoji} onChange={v => update(idx, "emoji", v)} placeholder="📋" />
                        <Field label="Course Count" value={String(cat.count)} onChange={v => update(idx, "count", parseInt(v) || 0)} placeholder="12" />
                        <Field label="Link (href)" value={cat.href} onChange={v => update(idx, "href", v)} placeholder="/courses?cat=..." />
                    </div>
                </div>
            ))}
            <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm font-bold text-muted-foreground hover:text-primary transition-all">
                <Plus size={16} /> Add Category
            </button>
        </div>
    );
}

function WhyUsEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const s = (k: string) => (content[k] as string) ?? "";
    const u = (k: string, v: string) => onChange({ ...content, [k]: v });
    const features = (content.features as Array<{ emoji: string; title: string; body: string }>) ?? [];
    const updateFeat = (idx: number, key: string, val: string) => {
        const next = features.map((f, i) => i === idx ? { ...f, [key]: val } : f);
        onChange({ ...content, features: next });
    };
    const addFeat = () => onChange({ ...content, features: [...features, { emoji: "", title: "", body: "" }] });
    const removeFeat = (idx: number) => onChange({ ...content, features: features.filter((_, i) => i !== idx) });

    return (
        <div className="flex flex-col gap-5">
            <Field label="Section Headline" value={s("headline")} onChange={v => u("headline", v)} placeholder="Why Choose First Bencher?" />
            <Field label="Subheadline" value={s("subheadline")} onChange={v => u("subheadline", v)} type="textarea" rows={2} />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-2">Feature Cards</p>
            {features.map((feat, idx) => (
                <div key={idx} className="p-4 bg-accent/20 rounded-2xl border border-border">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-bold text-muted-foreground">Feature {idx + 1}</p>
                        <button onClick={() => removeFeat(idx)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Emoji Icon" value={feat.emoji} onChange={v => updateFeat(idx, "emoji", v)} placeholder="🏆" />
                        <Field label="Title" value={feat.title} onChange={v => updateFeat(idx, "title", v)} placeholder="Industry Certifications" />
                        <div className="col-span-2">
                            <RichTextEditor label="Body Text" value={feat.body} onChange={v => updateFeat(idx, "body", v)} />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addFeat} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm font-bold text-muted-foreground hover:text-primary transition-all">
                <Plus size={16} /> Add Feature Card
            </button>
        </div>
    );
}

function CtaBannerEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const s = (k: string) => (content[k] as string) ?? "";
    const u = (k: string, v: string) => onChange({ ...content, [k]: v });
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
                <Field label="Headline" value={s("headline")} onChange={v => u("headline", v)} placeholder="Ready to Advance Your Career?" />
            </div>
            <div className="md:col-span-2">
                <Field label="Sub-text" value={s("subtext")} onChange={v => u("subtext", v)} type="textarea" rows={2} />
            </div>
            <Field label="Button Text" value={s("button_text")} onChange={v => u("button_text", v)} placeholder="Explore Our Courses" />
            <Field label="Button Link" value={s("button_href")} onChange={v => u("button_href", v)} placeholder="/courses" />
            <Field label="Background Color" value={s("bg_color")} onChange={v => u("bg_color", v)} type="color" />
        </div>
    );
}

function CustomPageEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const hero = (content.hero as any) || {};
    const sections = (content.sections as any[]) || [];

    const updateHero = (key: string, val: string) => {
        onChange({ ...content, hero: { ...hero, [key]: val } });
    };

    const updateSection = (sIdx: number, updated: any) => {
        const next = [...sections];
        next[sIdx] = updated;
        onChange({ ...content, sections: next });
    };

    const addSection = () => {
        const newSec = {
            id: Math.random().toString(36).slice(2),
            layout: "1-col",
            columns: [{ type: "text", content: "" }]
        };
        onChange({ ...content, sections: [...sections, newSec] });
    };

    const removeSection = (sIdx: number) => {
        onChange({ ...content, sections: sections.filter((_, i) => i !== sIdx) });
    };

    return (
        <div className="space-y-12">
            {/* General Settings */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary">General Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <p className="text-[10px] text-muted-foreground mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
                            Tip: The "Sidebar Title" is what you see in the admin menu. The Hero settings control what the user sees on the page.
                        </p>
                    </div>
                </div>
            </div>

            {/* Hero Part */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#a60303]/10 pb-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#a60303]">Hero Header Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Hero Title (Main)" value={hero.title || ""} onChange={v => updateHero("title", v)} placeholder="Pioneering Excellence" />
                    <Field label="Highlighted Word" value={hero.highlightedTitle || ""} onChange={v => updateHero("highlightedTitle", v)} placeholder="First Bencher" />
                    <div className="md:col-span-2">
                        <Field label="Subtitle" value={hero.subtitle || ""} onChange={v => updateHero("subtitle", v)} type="textarea" rows={2} />
                    </div>
                    <Field label="Badge Text" value={hero.badgeText || ""} onChange={v => updateHero("badgeText", v)} placeholder="Our Story" />
                </div>
            </div>

            {/* Dynamic Sections */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Body Sections</h3>
                    <div className="flex gap-2">
                        <button onClick={addSection} className="flex items-center gap-1.5 text-xs font-bold text-[#a60303] hover:underline bg-[#a60303]/5 px-3 py-1.5 rounded-lg border border-[#a60303]/10">
                            <Plus size={14} /> Add Section
                        </button>
                    </div>
                </div>

                {sections.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl text-muted-foreground text-sm">
                        No sections added. Click "Add Section" to start building your page.
                    </div>
                )}

                <Reorder.Group axis="y" values={sections} onReorder={v => onChange({ ...content, sections: v })} className="flex flex-col gap-8">
                    {sections.map((sec, sIdx) => (
                        <Reorder.Item key={sec.id} value={sec} className="relative group bg-accent/5 rounded-3xl border border-border p-6 border-l-4 border-l-primary/30 shadow-sm cursor-default">
                            <div className="absolute -top-3 left-6 bg-white px-3 py-1 rounded-full border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Section {sIdx + 1}
                            </div>
                            
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <div className="p-2 text-gray-300 cursor-grab active:cursor-grabbing hover:text-primary transition-colors">
                                    <GripVertical size={18} />
                                </div>
                                <button 
                                    onClick={() => removeSection(sIdx)}
                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="space-y-6 mt-2">
                                {/* Layout Selection */}
                                <div className="flex items-center gap-6">
                                    <p className="text-xs font-bold text-muted-foreground">Layout:</p>
                                    <div className="flex gap-2">
                                        {[
                                            { id: "1-col", label: "Single Column" },
                                            { id: "2-col", label: "Split Row (2 Cols)" }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => {
                                                    const nextCols = opt.id === "2-col" 
                                                        ? [sec.columns[0] || {type: 'text', content: ''}, {type: 'image', image_url: ''}]
                                                        : [sec.columns[0]];
                                                    updateSection(sIdx, { ...sec, layout: opt.id, columns: nextCols });
                                                }}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                                    sec.layout === opt.id ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:bg-accent"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Columns Editor */}
                                <div className={cn("grid gap-8", sec.layout === "2-col" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                                    {sec.columns.map((col: any, cIdx: number) => (
                                        <div key={cIdx} className="space-y-4 p-4 bg-white rounded-2xl border border-border/50">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Column {cIdx + 1}</p>
                                                <select 
                                                    value={col.type} 
                                                    onChange={e => {
                                                        const nextCols = [...sec.columns];
                                                        nextCols[cIdx] = { ...nextCols[cIdx], type: e.target.value };
                                                        updateSection(sIdx, { ...sec, columns: nextCols });
                                                    }}
                                                    className="text-[10px] font-bold bg-accent/50 border border-border rounded-lg px-2 py-1 outline-none"
                                                >
                                                    <option value="text">Rich Text</option>
                                                    <option value="image">Image</option>
                                                </select>
                                            </div>

                                            {col.type === "text" ? (
                                                <RichTextEditor 
                                                    value={col.content || ""} 
                                                    onChange={v => {
                                                        const nextCols = [...sec.columns];
                                                        nextCols[cIdx] = { ...nextCols[cIdx], content: v };
                                                        updateSection(sIdx, { ...sec, columns: nextCols });
                                                    }}
                                                />
                                            ) : (
                                                <ImageUploadField 
                                                    label="Column Image" 
                                                    value={col.image_url || ""} 
                                                    onChange={v => {
                                                        const nextCols = [...sec.columns];
                                                        nextCols[cIdx] = { ...nextCols[cIdx], image_url: v };
                                                        updateSection(sIdx, { ...sec, columns: nextCols });
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                    {sections.length > 0 && (
                        <button onClick={addSection} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-[30px] text-sm font-bold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                            <Plus size={20} /> Add Another Section
                        </button>
                    )}
                </Reorder.Group>
            </div>
        </div>
    );
}

function AboutIntroEditor_Removed() {
    // This editor is replaced by AboutSectionEditor for consistency
    return null;
}

function AboutVisionEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const s = (k: string) => (content[k] as string) ?? "";
    const u = (k: string, v: string) => onChange({ ...content, [k]: v });
    return (
        <div className="flex flex-col gap-5">
            <Field label="Section Headline" value={s("headline")} onChange={v => u("headline", v)} />
            <Field label="Vision Title" value={s("vision_title")} onChange={v => u("vision_title", v)} placeholder="Vision" />
            <RichTextEditor label="Vision Text" value={s("vision_text")} onChange={v => u("vision_text", v)} />
            <Field label="Mission Title" value={s("mission_title")} onChange={v => u("mission_title", v)} placeholder="Mission" />
            <RichTextEditor label="Mission Text" value={s("mission_text")} onChange={v => u("mission_text", v)} />
        </div>
    );
}

function ValuesEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const values = (content.values as Array<{ emoji: string; title: string; body: string }>) ?? [];
    const update = (idx: number, key: string, val: string) => {
        const next = values.map((v, i) => i === idx ? { ...v, [key]: val } : v);
        onChange({ ...content, values: next });
    };
    const add = () => onChange({ ...content, values: [...values, { emoji: "", title: "", body: "" }] });
    const remove = (idx: number) => onChange({ ...content, values: values.filter((_, i) => i !== idx) });
    return (
        <div className="flex flex-col gap-4">
            {values.map((val, idx) => (
                <div key={idx} className="p-4 bg-accent/20 rounded-2xl border border-border">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-bold text-muted-foreground">Value {idx + 1}</p>
                        <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Emoji" value={val.emoji} onChange={v => update(idx, "emoji", v)} placeholder="🎯" />
                        <Field label="Title" value={val.title} onChange={v => update(idx, "title", v)} placeholder="Excellence" />
                        <div className="col-span-2"><RichTextEditor label="Body Text" value={val.body} onChange={v => update(idx, "body", v)} /></div>
                    </div>
                </div>
            ))}
            <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm font-bold text-muted-foreground hover:text-primary transition-all">
                <Plus size={16} /> Add Value Card
            </button>
        </div>
    );
}

function TeamEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const s = (k: string) => (content[k] as string) ?? "";
    const u = (k: string, v: string) => onChange({ ...content, [k]: v });
    const members = (content.members as Array<{ name: string; role: string; image_url: string; bio: string }>) ?? [];
    const update = (idx: number, key: string, val: string) => {
        const next = members.map((m, i) => i === idx ? { ...m, [key]: val } : m);
        onChange({ ...content, members: next });
    };
    const add = () => onChange({ ...content, members: [...members, { name: "", role: "", image_url: "", bio: "" }] });
    const remove = (idx: number) => onChange({ ...content, members: members.filter((_, i) => i !== idx) });
    return (
        <div className="flex flex-col gap-4">
            <Field label="Section Headline" value={s("headline")} onChange={v => u("headline", v)} placeholder="Meet Our Leadership" />
            {members.map((m, idx) => (
                <div key={idx} className="p-4 bg-accent/20 rounded-2xl border border-border">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-bold text-muted-foreground">Member {idx + 1}</p>
                        <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Name" value={m.name} onChange={v => update(idx, "name", v)} />
                        <Field label="Role / Title" value={m.role} onChange={v => update(idx, "role", v)} />
                        <div className="col-span-2">
                            <ImageUploadField label="Photo Upload" value={m.image_url} onChange={v => update(idx, "image_url", v)} />
                        </div>
                        <div className="col-span-2"><RichTextEditor label="Short Bio" value={m.bio} onChange={v => update(idx, "bio", v)} /></div>
                    </div>
                </div>
            ))}
            <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm font-bold text-muted-foreground hover:text-primary transition-all">
                <Plus size={16} /> Add Team Member
            </button>
        </div>
    );
}

function ContactHeaderEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const s = (k: string) => (content[k] as string) ?? "";
    const u = (k: string, v: string) => onChange({ ...content, [k]: v });
    return (
        <div className="flex flex-col gap-5">
            <Field label="Page Title" value={s("title")} onChange={v => u("title", v)} placeholder="Get In Touch" />
            <Field label="Subtitle" value={s("subtitle")} onChange={v => u("subtitle", v)} type="textarea" rows={2} />
            <Field label="Office Hours" value={s("office_hours")} onChange={v => u("office_hours", v)} placeholder="Mon – Fri: 9:00 AM – 6:00 PM (GMT)" />
        </div>
    );
}

function ContactDetailsEditor({ content, onChange }: { content: ContentMap; onChange: (c: ContentMap) => void }) {
    const s = (k: string) => (content[k] as string) ?? "";
    const u = (k: string, v: string) => onChange({ ...content, [k]: v });
    return (
        <div className="flex flex-col gap-5">
            <Field label="Email Address" value={s("email")} onChange={v => u("email", v)} placeholder="info@firstbencher.com" />
            <Field label="Phone Number" value={s("phone")} onChange={v => u("phone", v)} placeholder="+1 (234) 567-8900" />
            <Field label="Address" value={s("address")} onChange={v => u("address", v)} type="textarea" rows={2} />
            <Field label="Google Maps Embed URL" value={s("map_embed_url")} onChange={v => u("map_embed_url", v)} type="url" placeholder="https://maps.google.com/..." />
        </div>
    );
}

// ── Section editor router ──────────────────────────────────────
function SectionEditor({ sectionId, content, onChange }: { sectionId: string; content: ContentMap; onChange: (c: ContentMap) => void }) {
    if (sectionId.startsWith("custom_page:")) {
        return <CustomPageEditor content={content} onChange={onChange} />;
    }
    switch (sectionId) {
        case "home_hero": return <HomeHeroEditor content={content} onChange={onChange} />;
        case "home_about": return <AboutSectionEditor content={content} onChange={onChange} isHomePage={true} />;
        case "home_stats_cta": return <HomeStatsCTAEditor content={content} onChange={onChange} />;
        case "home_stats": return <HomeStatsEditor content={content} onChange={onChange} />;
        case "home_categories": return <CategoryGridEditor content={content} onChange={onChange} />;
        case "home_why_us": return <WhyUsEditor content={content} onChange={onChange} />;
        case "home_cta": return <CtaBannerEditor content={content} onChange={onChange} />;
        case "about_intro": return <AboutSectionEditor content={content} onChange={onChange} isHomePage={false} />;
        case "about_vision": return <AboutVisionEditor content={content} onChange={onChange} />;
        case "about_values": return <ValuesEditor content={content} onChange={onChange} />;
        case "about_team": return <TeamEditor content={content} onChange={onChange} />;
        case "contact_header": return <ContactHeaderEditor content={content} onChange={onChange} />;
        case "contact_details": return <ContactDetailsEditor content={content} onChange={onChange} />;
        default:
            return (
                <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                    <Settings size={36} className="text-muted-foreground/40" />
                    <p className="text-muted-foreground text-sm">Editor for <strong>{sectionId}</strong> coming soon.</p>
                </div>
            );
    }
}

// ── SEO Types & Scoring ────────────────────────────────────────

type SeoData = {
    seoTitle: string;
    metaDescription: string;
    focusKeyword: string;
    supportingKeywords: string[];
    slug: string;
};

const defaultSeo: SeoData = { seoTitle: "", metaDescription: "", focusKeyword: "", supportingKeywords: [], slug: "" };

type SeoCheck = { pass: boolean; label: string; points: number; suggestion?: string };

function computeSeoScore(seo: SeoData): { score: number; checks: SeoCheck[] } {
    const title = (seo.seoTitle || "").trim();
    const desc = (seo.metaDescription || "").trim();
    const kw = (seo.focusKeyword || "").trim().toLowerCase();
    const slug = (seo.slug || "").trim().toLowerCase();
    const kwSlug = kw.replace(/\s+/g, "-");
    const supporting = seo.supportingKeywords || [];
    const checks: SeoCheck[] = [];
    let score = 0;

    const add = (pass: boolean, label: string, points: number, suggestion?: string) => {
        if (pass) score += points;
        checks.push({ pass, label, points, suggestion });
    };

    add(title.length > 0, "SEO title is set", 5, "Add an SEO title in the field above");
    add(desc.length > 0, "Meta description is set", 5, "Write a compelling meta description");
    add(kw.length > 0, "Focus keyword is set", 5, "Enter the main keyword you want to rank for");

    if (kw) {
        add(title.toLowerCase().includes(kw), `Focus keyword in SEO title`, 15, `Add "${kw}" to your SEO title`);
        add(title.toLowerCase().startsWith(kw), `Focus keyword at start of SEO title`, 10, `Move "${kw}" to the beginning of your SEO title`);
        add(desc.toLowerCase().includes(kw), `Focus keyword in meta description`, 15, `Include "${kw}" naturally in your meta description`);
        add(slug.includes(kwSlug), `Focus keyword in URL slug`, 10, `Add "${kwSlug}" to the URL slug`);
    } else {
        checks.push({ pass: false, label: "Focus keyword in SEO title (+15)", points: 15, suggestion: "Set a focus keyword first" });
        checks.push({ pass: false, label: "Focus keyword at start of title (+10)", points: 10, suggestion: "Set a focus keyword first" });
        checks.push({ pass: false, label: "Focus keyword in meta description (+15)", points: 15, suggestion: "Set a focus keyword first" });
        checks.push({ pass: false, label: "Focus keyword in URL slug (+10)", points: 10, suggestion: "Set a focus keyword first" });
    }

    add(title.length >= 50 && title.length <= 60, `SEO title length 50-60 chars (${title.length})`, 10,
        title.length < 50 ? `Add ${50 - title.length} more characters` : `Remove ${title.length - 60} characters`);
    add(desc.length >= 120 && desc.length <= 160, `Meta description 120-160 chars (${desc.length})`, 10,
        desc.length < 120 ? `Add ${120 - desc.length} more characters` : `Remove ${desc.length - 160} characters`);
    add(supporting.length >= 2, `Supporting keywords added (${supporting.length}/2 min)`, 10, "Add at least 2 supporting keywords");
    add(slug.length > 0 && !/\s/.test(slug), "URL slug is set and clean", 5, "Set a clean URL slug without spaces");

    return { score, checks };
}

// ── Main component ─────────────────────────────────────────────
export default function WebPagesEditor() {
    const [view, setView] = useState<"list" | "edit">("list");
    const [pages, setPages] = useState<any[]>(BASE_PAGES);
    const [editingPage, setEditingPage] = useState<any>(null);
    const [selectedSection, setSelectedSection] = useState<any>(null);
    const [contentMap, setContentMap] = useState<Record<string, ContentMap>>({});
    const [seoData, setSeoData] = useState<SeoData>(defaultSeo);
    const [loadingSection, setLoadingSection] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPageData, setNewPageData] = useState({ title: "", slug: "" });
    const [newKw, setNewKw] = useState("");
    const [listSearch, setListSearch] = useState("");

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchAllData = useCallback(async () => {
        try {
            const res = await fetch("/api/pages-content?page=system:custom_pages");
            const data = await res.json();
            const customList = (data.content?.pages as any[]) || [];
            const customPages = customList.map(p => ({
                id: `custom_page:${p.slug}`,
                name: p.name,
                slug: `/${p.slug}`,
                icon: Globe,
                isCustom: true,
                sections: [{ id: `custom_page:${p.slug}`, name: "Page Content Builder" }]
            }));
            setPages([...BASE_PAGES, ...customPages]);
        } catch (err) {
            console.error("Failed to fetch custom pages index", err);
        }
    }, []);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    // ── Enter edit mode for a page ────────────────────────────────
    const enterEditMode = async (page: any) => {
        const firstSection = page.sections[0];
        setEditingPage(page);
        setSelectedSection(firstSection);
        setView("edit");
        setLoadingSection(true);
        try {
            const [secRes, seoRes] = await Promise.all([
                fetch(`/api/pages-content?page=${firstSection.id}`),
                fetch(`/api/pages-content?page=seo:${page.id}`),
            ]);
            const secData = await secRes.json();
            const seoDb = await seoRes.json();
            setContentMap({ [firstSection.id]: (secData.content as ContentMap) || {} });
            setSeoData({ ...defaultSeo, ...(seoDb.content as Partial<SeoData> || {}) });
        } finally {
            setLoadingSection(false);
        }
    };

    // ── Fetch individual section ──────────────────────────────────
    const fetchSection = useCallback(async (sectionId: string) => {
        if (contentMap[sectionId]) return;
        setLoadingSection(true);
        try {
            const res = await fetch(`/api/pages-content?page=${sectionId}`);
            const data = await res.json();
            setContentMap(prev => ({ ...prev, [sectionId]: (data.content as ContentMap) || {} }));
        } finally {
            setLoadingSection(false);
        }
    }, [contentMap]);

    useEffect(() => {
        if (view === "edit" && selectedSection) fetchSection(selectedSection.id);
    }, [selectedSection?.id]);

    const currentContent = (selectedSection ? contentMap[selectedSection.id] : {}) ?? {};
    const handleChange = (updated: ContentMap) =>
        setContentMap(prev => ({ ...prev, [selectedSection!.id]: updated }));

    // ── Save ──────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!editingPage || !selectedSection) return;
        setIsSaving(true);
        try {
            await Promise.all([
                fetch("/api/pages-content", {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ page_name: selectedSection.id, content: currentContent }),
                }),
                fetch("/api/pages-content", {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ page_name: `seo:${editingPage.id}`, content: seoData }),
                }),
            ]);
            showToast("success", "Saved successfully!");
        } catch {
            showToast("error", "Network error — changes not saved.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        if (!selectedSection) return;
        setContentMap(prev => { const n = { ...prev }; delete n[selectedSection.id]; return n; });
        setLoadingSection(true);
        try {
            const res = await fetch(`/api/pages-content?page=${selectedSection.id}`);
            const data = await res.json();
            setContentMap(prev => ({ ...prev, [selectedSection.id]: (data.content as ContentMap) || {} }));
        } finally { setLoadingSection(false); }
        showToast("success", "Content reloaded.");
    };

    const handleDeletePage = async () => {
        if (!editingPage?.isCustom) return;
        if (!confirm(`Delete "${editingPage.name}"?`)) return;
        try {
            const updatedList = pages.filter(p => p.isCustom && p.id !== editingPage.id)
                .map(p => ({ name: p.name, slug: p.id.replace("custom_page:", "") }));
            await fetch("/api/pages-content", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ page_name: "system:custom_pages", content: { pages: updatedList } }),
            });
            showToast("success", "Page deleted!");
            await fetchAllData();
            setView("list");
        } catch { showToast("error", "Failed to delete page."); }
    };

    const handleCreatePage = async () => {
        if (!newPageData.title || !newPageData.slug) return showToast("error", "Title and Slug are required.");
        const slug = newPageData.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
        const currentCustomList = pages.filter(p => p.isCustom).map(p => ({ name: p.name, slug: p.id.replace("custom_page:", "") }));
        try {
            await fetch("/api/pages-content", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ page_name: "system:custom_pages", content: { pages: [...currentCustomList, { name: newPageData.title, slug }] } }),
            });
            await fetchAllData();
            setIsCreateModalOpen(false);
            setNewPageData({ title: "", slug: "" });
            showToast("success", "Page created!");
        } catch { showToast("error", "Failed to create page."); }
    };

    // ── SEO helpers ───────────────────────────────────────────────
    const { score: seoScore, checks: seoChecks } = computeSeoScore(seoData);
    const scoreColor = seoScore >= 80 ? "#16a34a" : seoScore >= 50 ? "#ea580c" : "#dc2626";
    const scoreLabel = seoScore >= 80 ? "Good" : seoScore >= 50 ? "Needs Work" : "Poor";

    const addKw = () => {
        const t = newKw.trim();
        if (!t || seoData.supportingKeywords.includes(t)) return;
        setSeoData(s => ({ ...s, supportingKeywords: [...s.supportingKeywords, t] }));
        setNewKw("");
    };

    const filteredPages = pages.filter(p =>
        p.name.toLowerCase().includes(listSearch.toLowerCase()) ||
        (p.slug || "").toLowerCase().includes(listSearch.toLowerCase())
    );

    const inputCls = "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white";

    // ── Toast (shared) ────────────────────────────────────────────
    const ToastEl = toast && (
        <div className={cn("fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold",
            toast.type === "success" ? "bg-green-500" : "bg-red-500")}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.msg}
        </div>
    );

    // ── Create page modal (shared) ────────────────────────────────
    const CreateModal = isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-black mb-1">Create New Page</h3>
                <p className="text-sm text-muted-foreground mb-6">Define a title and permanent URL slug.</p>
                <div className="space-y-4">
                    <Field label="Page Title" value={newPageData.title} onChange={v => setNewPageData(p => ({ ...p, title: v }))} placeholder="e.g. Our Services" />
                    <Field label="URL Slug" value={newPageData.slug} onChange={v => setNewPageData(p => ({ ...p, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} placeholder="e.g. our-services" />
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border font-bold text-sm text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={handleCreatePage} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all">Create Page</button>
                </div>
            </div>
        </div>
    );

    // ════════════════════════════════════════
    // LIST VIEW
    // ════════════════════════════════════════
    if (view === "list") {
        return (
            <div className="flex flex-col gap-8 pb-10">
                {ToastEl}{CreateModal}

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-foreground mb-1">Web Pages</h1>
                        <p className="text-muted-foreground text-sm">Manage content and SEO for all public website pages.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all text-sm shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} /> New Page
                    </button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={listSearch}
                        onChange={e => setListSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Page</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">URL</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Sections</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPages.map(page => {
                                const Icon = page.icon;
                                return (
                                    <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Icon size={16} className="text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{page.name}</p>
                                                    {page.isCustom && <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-0.5 inline-block">Custom</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <div className="flex items-center gap-1.5">
                                                <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded font-mono">{page.slug || `/${page.id}`}</code>
                                                <a href={page.slug || `/${page.id}`} target="_blank" className="text-gray-400 hover:text-primary transition-colors">
                                                    <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", page.isCustom ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700")}>
                                                {page.isCustom ? "Custom" : "Built-in"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-sm text-gray-600">{page.sections.length} {page.sections.length === 1 ? "section" : "sections"}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => enterEditMode(page)}
                                                className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredPages.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">No pages found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════
    // EDIT VIEW
    // ════════════════════════════════════════
    const EditIcon = editingPage?.icon || Globe;

    return (
        <div className="flex flex-col gap-6 pb-10">
            {ToastEl}{CreateModal}

            {/* Edit header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setView("list")}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <span className="text-gray-300">/</span>
                    <EditIcon size={16} className="text-primary" />
                    <h1 className="text-lg font-black text-foreground">{editingPage?.name}</h1>
                    {editingPage?.isCustom && (
                        <a href={editingPage.slug} target="_blank" className="text-xs text-gray-400 hover:text-primary flex items-center gap-1 transition-colors">
                            <ExternalLink size={12} /> View Live
                        </a>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {editingPage?.isCustom && (
                        <button onClick={handleDeletePage} className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors flex items-center gap-2">
                            <Trash2 size={14} /> Delete
                        </button>
                    )}
                    <button onClick={handleReset} className="px-4 py-2 rounded-xl border border-border bg-background text-sm font-bold flex items-center gap-2 hover:bg-accent transition-all">
                        <RotateCcw size={14} /> Reset
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-60 text-sm">
                        {isSaving ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
                    </button>
                </div>
            </div>

            {/* 3-column grid: sections sidebar | editor | SEO panel */}
            <div className="grid grid-cols-1 lg:grid-cols-[210px_1fr_320px] gap-6 items-start">

                {/* ── Sections sidebar ── */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Sections</p>
                    </div>
                    <div className="flex flex-col">
                        {editingPage?.sections.map((sec: any) => (
                            <button
                                key={sec.id}
                                onClick={() => setSelectedSection(sec)}
                                className={cn(
                                    "text-left px-4 py-3 text-sm font-semibold border-b border-gray-50 last:border-0 transition-all flex items-center justify-between",
                                    selectedSection?.id === sec.id
                                        ? "text-primary bg-primary/5 border-l-2 border-l-primary"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                {sec.name}
                                {selectedSection?.id === sec.id && <ChevronRight size={14} className="text-primary" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Section editor ── */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">{editingPage?.name}</span>
                        <span className="text-gray-400">›</span>
                        <span className="text-sm font-bold text-gray-700">{selectedSection?.name}</span>
                    </div>
                    <div className="p-6 lg:p-8 min-h-[500px]">
                        {loadingSection ? (
                            <div className="flex items-center justify-center h-64 flex-col gap-4">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm text-gray-400">Loading…</p>
                            </div>
                        ) : selectedSection ? (
                            <SectionEditor sectionId={selectedSection.id} content={currentContent} onChange={handleChange} />
                        ) : null}
                    </div>
                </div>

                {/* ── SEO Panel ── */}
                <div className="flex flex-col gap-4">

                    {/* Score card */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <Target size={18} className="text-primary" />
                            <h3 className="font-black text-gray-900 text-sm">SEO Score</h3>
                        </div>

                        {/* Circular score */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative w-20 h-20 shrink-0">
                                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                                    <circle
                                        cx="18" cy="18" r="15.9" fill="none"
                                        stroke={scoreColor} strokeWidth="3" strokeLinecap="round"
                                        strokeDasharray={`${seoScore} 100`}
                                        style={{ transition: "stroke-dasharray 0.5s ease" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black" style={{ color: scoreColor }}>{seoScore}</span>
                                    <span className="text-[9px] font-bold text-gray-400">/100</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-black text-lg" style={{ color: scoreColor }}>{scoreLabel}</p>
                                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                                    {seoScore >= 80 ? "Great SEO! Keep it up." : seoScore >= 50 ? "Fix the issues below to improve." : "Several improvements needed."}
                                </p>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                            {seoChecks.map((chk, i) => (
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
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <TrendingUp size={16} className="text-primary" />
                            <h3 className="font-black text-gray-900 text-sm">SEO Settings</h3>
                        </div>

                        {/* Slug */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">URL Slug</label>
                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                <span className="text-gray-400 text-xs font-mono shrink-0">/</span>
                                <input
                                    type="text"
                                    value={seoData.slug}
                                    onChange={e => setSeoData(s => ({ ...s, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                                    placeholder="page-url-slug"
                                    className="flex-1 text-sm outline-none bg-transparent"
                                />
                            </div>
                        </div>

                        {/* SEO Title */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">SEO Title</label>
                                <span className={cn("text-[10px] font-bold", seoData.seoTitle.length > 60 ? "text-red-500" : seoData.seoTitle.length >= 50 ? "text-green-600" : "text-gray-400")}>
                                    {seoData.seoTitle.length}/60
                                </span>
                            </div>
                            <input
                                type="text"
                                value={seoData.seoTitle}
                                onChange={e => setSeoData(s => ({ ...s, seoTitle: e.target.value }))}
                                placeholder="Page title for search engines"
                                className={inputCls}
                                maxLength={70}
                            />
                            <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all", seoData.seoTitle.length > 60 ? "bg-red-400" : seoData.seoTitle.length >= 50 ? "bg-green-400" : "bg-orange-300")}
                                    style={{ width: `${Math.min(100, (seoData.seoTitle.length / 60) * 100)}%` }} />
                            </div>
                        </div>

                        {/* Meta Description */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Meta Description</label>
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
                                <div className={cn("h-full rounded-full transition-all", seoData.metaDescription.length > 160 ? "bg-red-400" : seoData.metaDescription.length >= 120 ? "bg-green-400" : "bg-orange-300")}
                                    style={{ width: `${Math.min(100, (seoData.metaDescription.length / 160) * 100)}%` }} />
                            </div>
                        </div>

                        {/* Focus Keyword */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Focus Keyword</label>
                            <input
                                type="text"
                                value={seoData.focusKeyword}
                                onChange={e => setSeoData(s => ({ ...s, focusKeyword: e.target.value }))}
                                placeholder="e.g. project management course"
                                className={inputCls}
                            />
                        </div>

                        {/* Supporting Keywords */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Supporting Keywords</label>
                            {seoData.supportingKeywords.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {seoData.supportingKeywords.map(kw => (
                                        <span key={kw} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                                            {kw}
                                            <button onClick={() => setSeoData(s => ({ ...s, supportingKeywords: s.supportingKeywords.filter(k => k !== kw) }))} className="hover:text-red-500 transition-colors">
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
            </div>
        </div>
    );
}
