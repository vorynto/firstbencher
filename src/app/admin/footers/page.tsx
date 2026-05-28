"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Plus, Trash2, Save, Loader2, CheckCircle2, AlertCircle,
    PanelBottom, Star, Edit2, X
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
type FooterLink = { name: string; href: string; _id: string };
type FooterVariant = { id: string; name: string; is_default: boolean; page_key: string };
type FooterContent = {
    tagline: string;
    email: string;
    phone: string;
    address: string;
    facebook_url: string;
    twitter_url: string;
    linkedin_url: string;
    instagram_url: string;
    show_socials: boolean;
    copyright_text: string;
    company_links: FooterLink[];
    legal_links: FooterLink[];
};

const BLANK_CONTENT: FooterContent = {
    tagline: "",
    email: "",
    phone: "",
    address: "",
    facebook_url: "",
    twitter_url: "",
    linkedin_url: "",
    instagram_url: "",
    show_socials: true,
    copyright_text: "© {year} First Bencher. All rights reserved.",
    company_links: [],
    legal_links: [],
};

function Field({ label, value, onChange, placeholder = "" }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
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

function ensureIds(links: any[]): FooterLink[] {
    return (links || []).map(l => ({
        ...l,
        _id: l._id || Math.random().toString(36).slice(2),
    }));
}

function LinkListEditor({
    label,
    links,
    onChange,
}: {
    label: string;
    links: FooterLink[];
    onChange: (links: FooterLink[]) => void;
}) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <div className="space-y-2">
                {links.map((lnk, idx) => (
                    <div key={lnk._id} className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={lnk.name}
                            placeholder="Link Name"
                            onChange={e => {
                                const n = [...links];
                                n[idx] = { ...n[idx], name: e.target.value };
                                onChange(n);
                            }}
                            className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            value={lnk.href}
                            placeholder="URL / Slug"
                            onChange={e => {
                                const n = [...links];
                                n[idx] = { ...n[idx], href: e.target.value };
                                onChange(n);
                            }}
                            className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary"
                        />
                        <button
                            onClick={() => onChange(links.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-600"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={() => onChange([...links, { name: "", href: "", _id: Math.random().toString(36).slice(2) }])}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:border-primary hover:text-primary flex items-center justify-center gap-2"
            >
                <Plus size={15} /> Add Link
            </button>
        </div>
    );
}

// ── Footer content editor ──────────────────────────────────────
function FooterEditor({ content, onChange }: { content: FooterContent; onChange: (c: FooterContent) => void }) {
    const u = (key: keyof FooterContent, val: any) => onChange({ ...content, [key]: val });

    return (
        <div className="space-y-6">
            {/* Tagline & Copyright */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand</p>
                <Field
                    label="Tagline"
                    value={content.tagline}
                    onChange={v => u("tagline", v)}
                    placeholder="Global leader in providing training..."
                />
                <Field
                    label="Copyright Text"
                    value={content.copyright_text}
                    onChange={v => u("copyright_text", v)}
                    placeholder="© {year} Your Company. All rights reserved."
                />
                <p className="text-[11px] text-gray-400">Use <code className="bg-gray-200 px-1 rounded">{"{year}"}</code> to automatically insert the current year.</p>
            </div>

            {/* Contact info */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Info</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Email" value={content.email} onChange={v => u("email", v)} placeholder="info@example.com" />
                    <Field label="Phone" value={content.phone} onChange={v => u("phone", v)} placeholder="+1 (234) 567-8900" />
                    <div className="md:col-span-2">
                        <Field label="Address" value={content.address} onChange={v => u("address", v)} placeholder="123 Business Avenue..." />
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Social Media</p>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={content.show_socials !== false}
                            onChange={e => u("show_socials", e.target.checked)}
                            className="w-4 h-4 rounded text-primary"
                        />
                        Show Social Icons
                    </label>
                </div>
                {content.show_socials !== false && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field label="Facebook URL" value={content.facebook_url} onChange={v => u("facebook_url", v)} placeholder="https://facebook.com/..." />
                        <Field label="Twitter / X URL" value={content.twitter_url} onChange={v => u("twitter_url", v)} placeholder="https://twitter.com/..." />
                        <Field label="LinkedIn URL" value={content.linkedin_url} onChange={v => u("linkedin_url", v)} placeholder="https://linkedin.com/..." />
                        <Field label="Instagram URL" value={content.instagram_url} onChange={v => u("instagram_url", v)} placeholder="https://instagram.com/..." />
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Navigation Links</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LinkListEditor
                        label="Quick Links"
                        links={content.company_links}
                        onChange={links => u("company_links", links)}
                    />
                    <LinkListEditor
                        label="Legal Links"
                        links={content.legal_links}
                        onChange={links => u("legal_links", links)}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminFootersPage() {
    const [variants, setVariants] = useState<FooterVariant[]>([]);
    const [contentMap, setContentMap] = useState<Record<string, FooterContent>>({});
    const [selected, setSelected] = useState<FooterVariant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [createModal, setCreateModal] = useState(false);
    const [newName, setNewName] = useState("");

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchRegistry = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/pages-content?page=system:footers");
            const data = await res.json();
            const list: FooterVariant[] = (data.content?.variants as FooterVariant[]) || [];
            if (!list.find(v => v.id === "default")) {
                list.unshift({ id: "default", name: "Default Footer", is_default: true, page_key: "site_footer" });
            }
            setVariants(list);
            if (!selected && list.length > 0) setSelected(list[0]);
        } catch { /* use empty */ }
        setLoading(false);
    }, []);

    useEffect(() => { fetchRegistry(); }, [fetchRegistry]);

    useEffect(() => {
        if (!selected) return;
        if (contentMap[selected.id]) return;
        fetch(`/api/pages-content?page=${selected.page_key}`)
            .then(r => r.json())
            .then(data => {
                const c: FooterContent = {
                    ...BLANK_CONTENT,
                    ...(data.content || {}),
                    company_links: ensureIds((data.content?.company_links as any[]) || []),
                    legal_links: ensureIds((data.content?.legal_links as any[]) || []),
                };
                setContentMap(prev => ({ ...prev, [selected.id]: c }));
            });
    }, [selected?.id]);

    const saveRegistry = async (newVariants: FooterVariant[]) => {
        await fetch("/api/pages-content", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page_name: "system:footers", content: { variants: newVariants } }),
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

    const handleSetDefault = async (variant: FooterVariant) => {
        const updated = variants.map(v => ({ ...v, is_default: v.id === variant.id }));
        setVariants(updated);
        await saveRegistry(updated);
        showToast("success", `"${variant.name}" set as default.`);
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const id = Math.random().toString(36).slice(2, 10);
        const page_key = `footer:${id}`;
        const newVariant: FooterVariant = { id, name: newName.trim(), is_default: false, page_key };

        const defaultContent = contentMap["default"] || BLANK_CONTENT;
        await fetch("/api/pages-content", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page_name: page_key, content: defaultContent }),
        });

        const updated = [...variants, newVariant];
        await saveRegistry(updated);
        setVariants(updated);
        setContentMap(prev => ({
            ...prev,
            [id]: {
                ...defaultContent,
                company_links: ensureIds(defaultContent.company_links),
                legal_links: ensureIds(defaultContent.legal_links),
            },
        }));
        setSelected(newVariant);
        setCreateModal(false);
        setNewName("");
        showToast("success", `"${newVariant.name}" created!`);
    };

    const handleDelete = async (variant: FooterVariant) => {
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
                            <h3 className="text-lg font-black">New Footer Variant</h3>
                            <button onClick={() => setCreateModal(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-1.5 mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Footer Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleCreate()}
                                placeholder="e.g. Marketing Footer"
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                autoFocus
                            />
                            <p className="text-xs text-gray-400 mt-1">Pre-filled with Default Footer content as a starting point.</p>
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
                            <PanelBottom size={20} className="text-primary" />
                        </div>
                        Footer Variants
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 ml-1">Create multiple footers and assign them to specific pages.</p>
                </div>
                <button
                    onClick={() => setCreateModal(true)}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20"
                >
                    <Plus size={18} /> New Footer
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-gray-300" /></div>
            ) : (
                <div className="flex gap-6 items-start">
                    {/* Variants list */}
                    <div className="w-64 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider">All Footers</p>
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
                                <FooterEditor
                                    content={currentContent}
                                    onChange={c => setContentMap(prev => ({ ...prev, [selected.id]: c }))}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
