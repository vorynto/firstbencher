"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Plus, Trash2, Save, Loader2, CheckCircle2, AlertCircle,
    PanelTop, Star, GripVertical, Edit2, X
} from "lucide-react";
import { Reorder } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
type NavLink = { name: string; href: string; hasDropdown: boolean; subLinks?: NavLink[]; _id: string };
type NavCategory = { name: string; emoji: string; count: number; _id: string };
type HeaderVariant = { id: string; name: string; is_default: boolean; page_key: string };
type HeaderContent = {
    email: string; phone: string; address: string;
    nav_links: NavLink[];
    nav_categories: NavCategory[];
    show_search: boolean; show_cart: boolean; auth_buttons_active: boolean;
    login_text: string; login_href: string;
    register_text: string; register_href: string;
};

const BLANK_CONTENT: HeaderContent = {
    email: "", phone: "", address: "",
    nav_links: [],
    nav_categories: [],
    show_search: true, show_cart: true, auth_buttons_active: true,
    login_text: "Login", login_href: "/login",
    register_text: "Register", register_href: "/register",
};

function Field({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
            />
        </div>
    );
}

function ensureIds(links: any[]): NavLink[] {
    return (links || []).map(l => ({
        ...l,
        _id: l._id || Math.random().toString(36).slice(2),
        subLinks: l.subLinks ? ensureIds(l.subLinks) : undefined,
    }));
}

function ensureCategoryIds(cats: any[]): NavCategory[] {
    return (cats || []).map(c => ({
        name: c.name || "",
        emoji: c.emoji || "📚",
        count: c.count ?? 0,
        _id: c._id || Math.random().toString(36).slice(2),
    }));
}

// ── Header content editor (mirrors Settings > Header Config) ──
function HeaderEditor({ content, onChange, dbCategories }: {
    content: HeaderContent;
    onChange: (c: HeaderContent) => void;
    dbCategories: string[];
}) {
    const u = (key: keyof HeaderContent, val: any) => onChange({ ...content, [key]: val });
    const links = content.nav_links || [];
    const cats = content.nav_categories || [];

    return (
        <div className="space-y-6">
            {/* Contact info */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Bar</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Email" value={content.email} onChange={v => u("email", v)} placeholder="info@firstbencher.com" />
                    <Field label="Phone" value={content.phone} onChange={v => u("phone", v)} placeholder="+1 (234) 567-8900" />
                    <div className="md:col-span-2">
                        <Field label="Address" value={content.address} onChange={v => u("address", v)} placeholder="123 Business Avenue..." />
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Navigation Links</p>
                <Reorder.Group axis="y" values={links} onReorder={v => u("nav_links", v)} className="space-y-3">
                    {links.map((lnk, idx) => (
                        <Reorder.Item key={lnk._id} value={lnk} className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-gray-200 relative pl-9">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 cursor-grab"><GripVertical size={18} /></div>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text" value={lnk.name} placeholder="Link Name"
                                    onChange={e => { const n = [...links]; n[idx] = { ...n[idx], name: e.target.value }; u("nav_links", n); }}
                                    className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary"
                                />
                                <input
                                    type="text" value={lnk.href} placeholder="URL / Slug"
                                    onChange={e => { const n = [...links]; n[idx] = { ...n[idx], href: e.target.value }; u("nav_links", n); }}
                                    className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary"
                                />
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 whitespace-nowrap">
                                    <input type="checkbox" checked={lnk.hasDropdown}
                                        onChange={e => { const n = [...links]; n[idx] = { ...n[idx], hasDropdown: e.target.checked }; u("nav_links", n); }}
                                        className="w-3.5 h-3.5 rounded text-primary" />
                                    Dropdown
                                </label>
                                <button onClick={() => u("nav_links", links.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            {lnk.hasDropdown && (
                                <div className="pl-3 space-y-2">
                                    {(lnk.subLinks || []).map((sub, si) => (
                                        <div key={sub._id || si} className="flex gap-2 items-center">
                                            <input type="text" value={sub.name} placeholder="Sub link name"
                                                onChange={e => {
                                                    const n = [...links]; const sl = [...(n[idx].subLinks || [])];
                                                    sl[si] = { ...sl[si], name: e.target.value }; n[idx] = { ...n[idx], subLinks: sl }; u("nav_links", n);
                                                }}
                                                className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary" />
                                            <input type="text" value={sub.href} placeholder="URL"
                                                onChange={e => {
                                                    const n = [...links]; const sl = [...(n[idx].subLinks || [])];
                                                    sl[si] = { ...sl[si], href: e.target.value }; n[idx] = { ...n[idx], subLinks: sl }; u("nav_links", n);
                                                }}
                                                className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary" />
                                            <button onClick={() => {
                                                const n = [...links]; n[idx] = { ...n[idx], subLinks: (n[idx].subLinks || []).filter((_, i) => i !== si) }; u("nav_links", n);
                                            }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        const n = [...links];
                                        n[idx] = { ...n[idx], subLinks: [...(n[idx].subLinks || []), { name: "", href: "", hasDropdown: false, _id: Math.random().toString(36).slice(2) }] };
                                        u("nav_links", n);
                                    }} className="text-xs font-bold text-primary hover:underline">+ Add Sub-link</button>
                                </div>
                            )}
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
                <button
                    onClick={() => u("nav_links", [...links, { name: "", href: "", hasDropdown: false, _id: Math.random().toString(36).slice(2) }])}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:border-primary hover:text-primary flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Add Nav Link
                </button>
            </div>

            {/* Category Dropdown */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category Dropdown</p>
                    <span className="text-[10px] text-gray-400 font-medium">Shown in header nav &amp; mobile drawer</span>
                </div>
                {cats.length === 0 && (
                    <p className="text-xs text-gray-400 italic py-1">No categories configured — using built-in defaults.</p>
                )}
                <Reorder.Group axis="y" values={cats} onReorder={v => u("nav_categories", v)} className="space-y-2">
                    {cats.map((cat, idx) => (
                        <Reorder.Item key={cat._id} value={cat} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 relative pl-9">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 cursor-grab">
                                <GripVertical size={16} />
                            </div>

                            {/* Emoji */}
                            <input
                                type="text"
                                value={cat.emoji}
                                onChange={e => { const n = [...cats]; n[idx] = { ...n[idx], emoji: e.target.value }; u("nav_categories", n); }}
                                placeholder="📋"
                                className="w-12 px-2 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary text-center"
                                title="Emoji"
                            />

                            {/* Category name — dropdown of DB course categories */}
                            <select
                                value={cat.name}
                                onChange={e => { const n = [...cats]; n[idx] = { ...n[idx], name: e.target.value }; u("nav_categories", n); }}
                                className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary bg-white"
                            >
                                <option value="">— Select course category —</option>
                                {dbCategories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                                {/* Keep existing value visible even if not in DB yet */}
                                {cat.name && !dbCategories.includes(cat.name) && (
                                    <option value={cat.name}>{cat.name} (custom)</option>
                                )}
                            </select>

                            {/* Course count label */}
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={cat.count}
                                    onChange={e => { const n = [...cats]; n[idx] = { ...n[idx], count: parseInt(e.target.value) || 0 }; u("nav_categories", n); }}
                                    placeholder="0"
                                    min={0}
                                    className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary text-center"
                                    title="Course count shown as label"
                                />
                                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">courses</span>
                            </div>

                            <button
                                onClick={() => u("nav_categories", cats.filter((_, i) => i !== idx))}
                                className="text-red-400 hover:text-red-600"
                            >
                                <Trash2 size={16} />
                            </button>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
                <button
                    onClick={() => u("nav_categories", [...cats, { name: "", emoji: "📚", count: 0, _id: Math.random().toString(36).slice(2) }])}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:border-primary hover:text-primary flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Add Category
                </button>
                {cats.length > 0 && (
                    <button
                        onClick={() => u("nav_categories", [])}
                        className="w-full py-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                    >
                        Reset to defaults (clear all)
                    </button>
                )}
            </div>

            {/* Buttons & toggles */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Actions & Buttons</p>
                <div className="flex flex-wrap gap-5">
                    {([
                        { key: "show_search", label: "Show Search" },
                        { key: "show_cart", label: "Show Cart" },
                        { key: "auth_buttons_active", label: "Show Login/Register" },
                    ] as const).map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={(content as any)[key] ?? true}
                                onChange={e => u(key, e.target.checked)}
                                className="w-4 h-4 rounded text-primary" />
                            {label}
                        </label>
                    ))}
                </div>
                {content.auth_buttons_active !== false && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase">Login Button</p>
                            <Field label="Text" value={content.login_text} onChange={v => u("login_text", v)} />
                            <Field label="URL" value={content.login_href} onChange={v => u("login_href", v)} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase">Register Button</p>
                            <Field label="Text" value={content.register_text} onChange={v => u("register_text", v)} />
                            <Field label="URL" value={content.register_href} onChange={v => u("register_href", v)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminHeadersPage() {
    const [variants, setVariants] = useState<HeaderVariant[]>([]);
    const [contentMap, setContentMap] = useState<Record<string, HeaderContent>>({});
    const [selected, setSelected] = useState<HeaderVariant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [createModal, setCreateModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [dbCategories, setDbCategories] = useState<string[]>([]);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchRegistry = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/pages-content?page=system:headers");
            const data = await res.json();
            const list: HeaderVariant[] = (data.content?.variants as HeaderVariant[]) || [];
            // Always ensure a "default" variant exists representing site_header
            if (!list.find(v => v.id === "default")) {
                list.unshift({ id: "default", name: "Default Header", is_default: true, page_key: "site_header" });
            }
            setVariants(list);
            if (!selected && list.length > 0) {
                setSelected(list[0]);
            }
        } catch { /* use empty */ }
        setLoading(false);
    }, []);

    useEffect(() => { fetchRegistry(); }, [fetchRegistry]);

    // Fetch course categories from DB for the category dropdown editor
    useEffect(() => {
        fetch("/api/courses/categories")
            .then(r => r.json())
            .then(data => setDbCategories(data.categories || []))
            .catch(() => {});
    }, []);

    // Fetch content for a variant when selected
    useEffect(() => {
        if (!selected) return;
        if (contentMap[selected.id]) return;
        fetch(`/api/pages-content?page=${selected.page_key}`)
            .then(r => r.json())
            .then(data => {
                const c: HeaderContent = {
                    ...BLANK_CONTENT,
                    ...(data.content || {}),
                    nav_links: ensureIds((data.content?.nav_links as any[]) || []),
                    nav_categories: ensureCategoryIds((data.content?.nav_categories as any[]) || []),
                };
                setContentMap(prev => ({ ...prev, [selected.id]: c }));
            });
    }, [selected?.id]);

    const saveRegistry = async (newVariants: HeaderVariant[]) => {
        await fetch("/api/pages-content", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page_name: "system:headers", content: { variants: newVariants } }),
        });
    };

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await fetch("/api/pages-content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ page_name: selected.page_key, content: contentMap[selected.id] || {} }),
            });
            showToast("success", `"${selected.name}" saved!`);
        } catch {
            showToast("error", "Failed to save.");
        }
        setSaving(false);
    };

    const handleSetDefault = async (variant: HeaderVariant) => {
        const updated = variants.map(v => ({ ...v, is_default: v.id === variant.id }));
        setVariants(updated);
        await saveRegistry(updated);
        showToast("success", `"${variant.name}" set as default.`);
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const id = Math.random().toString(36).slice(2, 10);
        const page_key = `header:${id}`;
        const newVariant: HeaderVariant = { id, name: newName.trim(), is_default: false, page_key };

        // Seed with default content
        const defaultContent = contentMap["default"] || BLANK_CONTENT;
        await fetch("/api/pages-content", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page_name: page_key, content: defaultContent }),
        });

        const updated = [...variants, newVariant];
        await saveRegistry(updated);
        setVariants(updated);
        setContentMap(prev => ({ ...prev, [id]: { ...defaultContent, nav_links: ensureIds(defaultContent.nav_links), nav_categories: ensureCategoryIds(defaultContent.nav_categories) } }));
        setSelected(newVariant);
        setCreateModal(false);
        setNewName("");
        showToast("success", `"${newVariant.name}" created!`);
    };

    const handleDelete = async (variant: HeaderVariant) => {
        if (variant.id === "default") return;
        if (!confirm(`Delete "${variant.name}"?`)) return;
        const updated = variants.filter(v => v.id !== variant.id);
        await saveRegistry(updated);
        setVariants(updated);
        if (selected?.id === variant.id) setSelected(updated[0] || null);
        showToast("success", `"${variant.name}" deleted.`);
    };

    const currentContent = selected ? (contentMap[selected.id] || BLANK_CONTENT) : BLANK_CONTENT;

    return (
        <div className="space-y-6 pb-10">
            {/* Toast */}
            {toast && (
                <div className={cn("fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold",
                    toast.type === "success" ? "bg-green-500" : "bg-primary-tint0")}>
                    {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Create modal */}
            {createModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black">New Header Variant</h3>
                            <button onClick={() => setCreateModal(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-1.5 mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Header Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleCreate()}
                                placeholder="e.g. Marketing Header"
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                autoFocus
                            />
                            <p className="text-xs text-gray-400 mt-1">Pre-filled with Default Header content as a starting point.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setCreateModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90">Create</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <PanelTop size={20} className="text-primary" />
                        </div>
                        Header Variants
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 ml-1">Create multiple headers and assign them to specific pages.</p>
                </div>
                <button
                    onClick={() => setCreateModal(true)}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20"
                >
                    <Plus size={18} /> New Header
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-gray-300" /></div>
            ) : (
                <div className="flex gap-6 items-start">
                    {/* Variants list */}
                    <div className="w-64 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider">All Headers</p>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {variants.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelected(v)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 flex items-center gap-3 transition-all group",
                                        selected?.id === v.id
                                            ? "bg-primary/5 border-l-2 border-l-primary"
                                            : "hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-sm font-bold truncate", selected?.id === v.id ? "text-primary" : "text-gray-800")}>
                                            {v.name}
                                        </p>
                                        {v.is_default && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full mt-0.5">
                                                <Star size={9} className="fill-current" /> Default
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Editor */}
                    {selected && (
                        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Edit2 size={16} className="text-gray-400" />
                                    <span className="font-bold text-gray-900">{selected.name}</span>
                                    {selected.is_default && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                            <Star size={9} className="fill-current" /> Default
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {!selected.is_default && (
                                        <>
                                            <button
                                                onClick={() => handleSetDefault(selected)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 text-amber-700 bg-amber-50 text-xs font-bold hover:bg-amber-100 transition-colors"
                                            >
                                                <Star size={13} /> Set as Default
                                            </button>
                                            <button
                                                onClick={() => handleDelete(selected)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-500 bg-primary-tint text-xs font-bold hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-60"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        Save
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <HeaderEditor
                                    content={currentContent}
                                    onChange={c => setContentMap(prev => ({ ...prev, [selected.id]: c }))}
                                    dbCategories={dbCategories}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
