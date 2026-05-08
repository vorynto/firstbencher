"use client";

import React, { useState, useEffect } from "react";
import { 
    Save, Loader2, Image as ImageIcon, Palette, Type, MousePointer2, 
    AlertCircle, CheckCircle2, PanelTop, PanelBottom, Plus, Trash2, GripVertical 
} from "lucide-react";
import { Reorder } from "framer-motion";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────
type GlobalSettings = {
    logo_header: string;
    logo_footer: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    header_font_family: string;
    button_bg: string;
    button_text: string;
    button_hover_bg: string;
    button_hover_text: string;
};

const defaultSettings: GlobalSettings = {
    logo_header: "",
    logo_footer: "",
    primary_color: "#a60303",
    secondary_color: "#F07C5A",
    accent_color: "#f4f6ff",
    font_family: "Inter",
    header_font_family: "Inter",
    button_bg: "#a60303",
    button_text: "#ffffff",
    button_hover_bg: "#800202",
    button_hover_text: "#ffffff",
};

// ── Settings Page ──────────────────────────────────────────────
export default function SettingsPage() {
    // State
    const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
    const [header, setHeader] = useState<Record<string, any>>({});
    const [footer, setFooter] = useState<Record<string, any>>({});
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMenu, setStatusMenu] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [activeTab, setActiveTab] = useState<"branding" | "colors" | "typography" | "buttons" | "header" | "footer">("branding");

    useEffect(() => {
        fetchAllSettings();
    }, []);

    const ensureIds = (links: any[]): any[] => {
        if (!Array.isArray(links)) return [];
        return links.map(link => ({
            ...link,
            _id: link._id || Math.random().toString(36).slice(2),
            subLinks: link.subLinks ? ensureIds(link.subLinks) : undefined
        }));
    };

    const fetchAllSettings = async () => {
        try {
            const [gRes, hRes, fRes] = await Promise.all([
                fetch("/api/pages-content?page=global_settings"),
                fetch("/api/pages-content?page=site_header"),
                fetch("/api/pages-content?page=site_footer")
            ]);

            if (gRes.ok) {
                const data = await gRes.json();
                if (data.content && Object.keys(data.content).length > 0) setSettings(prev => ({ ...prev, ...data.content }));
            }
            if (hRes.ok) {
                const data = await hRes.json();
                if (data.content) {
                    const content = { ...data.content };
                    if (content.nav_links) content.nav_links = ensureIds(content.nav_links);
                    setHeader(content);
                }
            }
            if (fRes.ok) {
                const data = await fRes.json();
                if (data.content) {
                    const content = { ...data.content };
                    if (content.company_links) content.company_links = ensureIds(content.company_links);
                    if (content.legal_links) content.legal_links = ensureIds(content.legal_links);
                    setFooter(content);
                }
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setStatusMenu(null);
        try {
            const headers = { "Content-Type": "application/json" };
            const reqs = [
                fetch("/api/pages-content", { method: "PUT", headers, body: JSON.stringify({ page_name: "global_settings", content: settings }) }),
                fetch("/api/pages-content", { method: "PUT", headers, body: JSON.stringify({ page_name: "site_header", content: header }) }),
                fetch("/api/pages-content", { method: "PUT", headers, body: JSON.stringify({ page_name: "site_footer", content: footer }) })
            ];

            const results = await Promise.all(reqs);
            if (results.some(r => !r.ok)) throw new Error("Failed to save some settings");
            
            setStatusMenu({ type: "success", msg: "All settings updated successfully!" });
            setTimeout(() => setStatusMenu(null), 3000);
        } catch (err: unknown) {
            setStatusMenu({ type: "error", msg: (err as Error).message || "An error occurred" });
        } finally {
            setSaving(false);
        }
    };

    const handleGlobalChange = (key: keyof GlobalSettings, value: string) => setSettings(prev => ({ ...prev, [key]: value }));
    const handleHeaderChange = (key: string, value: any) => setHeader(prev => ({ ...prev, [key]: value }));
    const handleFooterChange = (key: string, value: any) => setFooter(prev => ({ ...prev, [key]: value }));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    const tabs = [
        { id: "branding", label: "Branding", icon: ImageIcon },
        { id: "colors", label: "Colors", icon: Palette },
        { id: "typography", label: "Typography", icon: Type },
        { id: "buttons", label: "Buttons", icon: MousePointer2 },
        { id: "header", label: "Header Config", icon: PanelTop },
        { id: "footer", label: "Footer Config", icon: PanelBottom },
    ] as const;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
                    <p className="text-gray-500 mt-1">Manage global variables, branding, header menus, and footer layouts.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-[#a60303] hover:bg-[#800202] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-[#a60303]/20 disabled:opacity-50 min-w-[140px]"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>

            {/* Status Messages */}
            {statusMenu && (
                <div className={cn(
                    "mb-6 p-4 rounded-xl flex items-center gap-3 font-medium",
                    statusMenu.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
                )}>
                    {statusMenu.type === "success" ? <CheckCircle2 size={20} className="text-green-600" /> : <AlertCircle size={20} className="text-red-600" />}
                    {statusMenu.msg}
                </div>
            )}

            {/* Layout Wrapper */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
                
                {/* Tabs Sidebar */}
                <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 p-4 shrink-0 flex flex-col gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left",
                                    isActive 
                                        ? "bg-white text-[#a60303] shadow-sm border border-gray-200" 
                                        : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
                                )}
                            >
                                <Icon size={18} className={isActive ? "text-[#a60303]" : "text-gray-400"} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                    
                    {/* BRANDING TAB */}
                    {activeTab === "branding" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Site Logos</h3>
                                <p className="text-sm text-gray-500 mb-6">Upload the default branding images for light and dark contexts across the site.</p>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                        <ImageUploadField 
                                            label="Header Logo (Light Backgrounds)" 
                                            value={settings.logo_header} 
                                            onChange={(val) => handleGlobalChange("logo_header", val)} 
                                        />
                                        <p className="text-xs text-gray-400 mt-2">Displayed in the main top navigation.</p>
                                    </div>
                                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
                                        <ImageUploadField 
                                            label="Footer Logo (Dark Backgrounds)" 
                                            value={settings.logo_footer} 
                                            onChange={(val) => handleGlobalChange("logo_footer", val)} 
                                        />
                                        <p className="text-xs text-gray-400 mt-2">Displayed in the dark Site Footer region.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COLORS TAB */}
                    {activeTab === "colors" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Color Palette</h3>
                                <p className="text-sm text-gray-500 mb-6">Select the primary hex codes that map to the internal styling system.</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <ColorPicker configKey="primary_color" label="Primary Theme Color" value={settings.primary_color} onChange={handleGlobalChange} />
                                    <ColorPicker configKey="secondary_color" label="Secondary Action Color" value={settings.secondary_color} onChange={handleGlobalChange} />
                                    <ColorPicker configKey="accent_color" label="Muted Accent Color" value={settings.accent_color} onChange={handleGlobalChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TYPOGRAPHY TAB */}
                    {activeTab === "typography" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Font Configuration</h3>
                                <p className="text-sm text-gray-500 mb-6">Select from popular Google Fonts automatically injected site-wide.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Base Font Family</label>
                                        <select
                                            value={settings.font_family}
                                            onChange={(e) => handleGlobalChange("font_family", e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#a60303] outline-none"
                                        >
                                            <option value="Inter">Inter (Default)</option>
                                            <option value="Roboto">Roboto</option>
                                            <option value="Outfit">Outfit</option>
                                            <option value="Open Sans">Open Sans</option>
                                            <option value="Poppins">Poppins</option>
                                            <option value="Montserrat">Montserrat</option>
                                            <option value="Lato">Lato</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Heading Font Family (Optional)</label>
                                        <select
                                            value={settings.header_font_family}
                                            onChange={(e) => handleGlobalChange("header_font_family", e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-[#a60303] outline-none"
                                        >
                                            <option value="Inter">Inherit Base Font</option>
                                            <option value="Playfair Display">Playfair Display (Serif)</option>
                                            <option value="Merriweather">Merriweather (Serif)</option>
                                            <option value="Oswald">Oswald (Industrial)</option>
                                            <option value="Bebas Neue">Bebas Neue (Bold)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BUTTONS TAB */}
                    {activeTab === "buttons" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Button Styling</h3>
                                <p className="text-sm text-gray-500 mb-6">Configure the global background and text colors for solid component buttons.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col gap-5">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Normal State</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <ColorPicker configKey="button_bg" label="Background" value={settings.button_bg} onChange={handleGlobalChange} />
                                            <ColorPicker configKey="button_text" label="Text Color" value={settings.button_text} onChange={handleGlobalChange} />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col gap-5">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Hover State</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <ColorPicker configKey="button_hover_bg" label="Background" value={settings.button_hover_bg} onChange={handleGlobalChange} />
                                            <ColorPicker configKey="button_hover_text" label="Text Color" value={settings.button_hover_text} onChange={handleGlobalChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HEADER CONFIG TAB */}
                    {activeTab === "header" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Header Configuration</h3>
                            <p className="text-sm text-gray-500 mb-6">Manage navigation links, top bar details, and action buttons.</p>
                            
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
                                <h4 className="text-sm font-bold border-b border-gray-200 pb-2">Top Bar Contact Info</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="Email" value={header.email || ""} onChange={v => handleHeaderChange("email", v)} placeholder="info@firstbencher.com" />
                                    <Field label="Phone" value={header.phone || ""} onChange={v => handleHeaderChange("phone", v)} placeholder="+1 (234) 567-8900" />
                                    <div className="md:col-span-2"><Field label="Address" value={header.address || ""} onChange={v => handleHeaderChange("address", v)} placeholder="123 Business Avenue..." /></div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
                                <h4 className="text-sm font-bold border-b border-gray-200 pb-2">Main Navigation Links</h4>
                                <Reorder.Group axis="y" values={header.nav_links || []} onReorder={v => handleHeaderChange("nav_links", v)} className="space-y-4">
                                {(header.nav_links as Array<any> || []).map((lnk, idx) => {
                                    return (
                                    <Reorder.Item key={lnk._id || `header-nav-${idx}`} value={lnk} className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm relative group pr-4 pl-10">
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-[#a60303] transition-colors rounded">
                                            <GripVertical size={20} />
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-3 items-end">
                                            <div className="flex-1 w-full"><Field label="Link Name" value={lnk.name} onChange={v => {
                                                const next = [...(header.nav_links || [])]; next[idx].name = v; handleHeaderChange("nav_links", next);
                                            }} placeholder="About Us" /></div>
                                            <div className="flex-1 w-full"><Field label="URL / Slug" value={lnk.href} onChange={v => {
                                                const next = [...(header.nav_links || [])]; next[idx].href = v; handleHeaderChange("nav_links", next);
                                            }} placeholder="/about" /></div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 pb-3">
                                                <input type="checkbox" checked={lnk.hasDropdown} onChange={e => {
                                                    const next = [...(header.nav_links || [])]; next[idx].hasDropdown = e.target.checked; handleHeaderChange("nav_links", next);
                                                }} className="w-4 h-4 rounded text-[#a60303]" />
                                                Has Dropdown
                                            </label>
                                            <button onClick={() => {
                                                const next = (header.nav_links || []).filter((_: unknown, i: number) => i !== idx); handleHeaderChange("nav_links", next);
                                            }} className="pb-3 text-red-400 hover:text-red-600 p-1"><Trash2 size={18} /></button>
                                        </div>
                                        {lnk.hasDropdown && (
                                            <div className="bg-gray-50 p-4 rounded-lg mt-2 border border-gray-100 flex flex-col gap-3">
                                                <h5 className="text-xs font-bold uppercase text-gray-500 mb-1">Dropdown Links</h5>
                                                <Reorder.Group axis="y" values={lnk.subLinks || []} onReorder={(newSubLinks) => {
                                                    const next = [...(header.nav_links || [])];
                                                    next[idx].subLinks = newSubLinks;
                                                    handleHeaderChange("nav_links", next);
                                                }} className="space-y-3">
                                                {(lnk.subLinks || []).map((subLnk: any, subIdx: number) => {
                                                    return (
                                                    <Reorder.Item key={subLnk._id || `sub-${idx}-${subIdx}`} value={subLnk} className="flex gap-2 items-center relative">
                                                        <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-[#a60303] transition-colors p-1"><GripVertical size={16} /></div>
                                                        <div className="flex-1 flex gap-2 items-end">
                                                            <Field value={subLnk.name} onChange={v => {
                                                                const next = [...(header.nav_links || [])];
                                                                next[idx].subLinks[subIdx].name = v;
                                                                handleHeaderChange("nav_links", next);
                                                            }} placeholder="Link Name" />
                                                            <Field value={subLnk.href} onChange={v => {
                                                                const next = [...(header.nav_links || [])];
                                                                next[idx].subLinks[subIdx].href = v;
                                                                handleHeaderChange("nav_links", next);
                                                            }} placeholder="URL / Slug" />
                                                            <button onClick={() => {
                                                                const next = [...(header.nav_links || [])];
                                                                next[idx].subLinks = (next[idx].subLinks || []).filter((_: unknown, i: number) => i !== subIdx);
                                                                handleHeaderChange("nav_links", next);
                                                            }} className="pb-2 text-red-400 p-1"><Trash2 size={16} /></button>
                                                        </div>
                                                    </Reorder.Item>
                                                    );
                                                })}
                                                </Reorder.Group>
                                                <button onClick={() => {
                                                    const next = [...(header.nav_links || [])];
                                                    if (!next[idx].subLinks) next[idx].subLinks = [];
                                                    next[idx].subLinks.push({ name: "", href: "", _id: Math.random().toString(36).slice(2) });
                                                    handleHeaderChange("nav_links", next);
                                                }} className="text-xs font-bold text-[#a60303] hover:underline self-start">
                                                    + Add Dropdown Link
                                                </button>
                                            </div>
                                        )}
                                    </Reorder.Item>
                                    );
                                })}
                                </Reorder.Group>
                                <button onClick={() => handleHeaderChange("nav_links", [...(header.nav_links || []), { name: "", href: "", hasDropdown: false, _id: Math.random().toString(36).slice(2) }])} className="flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:border-[#a60303] hover:text-[#a60303]">
                                    <Plus size={16} /> Add Link
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
                                <h4 className="text-sm font-bold border-b border-gray-200 pb-2">Header Actions & Buttons</h4>
                                <div className="flex flex-wrap gap-6 pt-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <input type="checkbox" checked={header.show_search ?? true} onChange={e => handleHeaderChange("show_search", e.target.checked)} className="w-4 h-4 rounded text-[#a60303]" /> Show Search
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <input type="checkbox" checked={header.show_cart ?? true} onChange={e => handleHeaderChange("show_cart", e.target.checked)} className="w-4 h-4 rounded text-[#a60303]" /> Show Cart
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <input type="checkbox" checked={header.auth_buttons_active ?? true} onChange={e => handleHeaderChange("auth_buttons_active", e.target.checked)} className="w-4 h-4 rounded text-[#a60303]" /> Show Login/Register
                                    </label>
                                </div>
                                {header.auth_buttons_active !== false && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Login Button</p>
                                            <Field label="Text" value={header.login_text || "Log in"} onChange={v => handleHeaderChange("login_text", v)} />
                                            <Field label="URL" value={header.login_href || "/login"} onChange={v => handleHeaderChange("login_href", v)} />
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Register Button</p>
                                            <Field label="Text" value={header.register_text || "Register"} onChange={v => handleHeaderChange("register_text", v)} />
                                            <Field label="URL" value={header.register_href || "/register"} onChange={v => handleHeaderChange("register_href", v)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* FOOTER CONFIG TAB */}
                    {activeTab === "footer" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Footer Configuration</h3>
                            <p className="text-sm text-gray-500 mb-6">Manage company info, social links, and footer navigation columns.</p>
                            
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
                                <h4 className="text-sm font-bold border-b border-gray-200 pb-2">Company Profile</h4>
                                <Field label="Company Tagline" value={footer.tagline || ""} onChange={v => handleFooterChange("tagline", v)} type="textarea" rows={2} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field label="Contact Email" value={footer.email || ""} onChange={v => handleFooterChange("email", v)} />
                                    <Field label="Contact Phone" value={footer.phone || ""} onChange={v => handleFooterChange("phone", v)} />
                                </div>
                                <Field label="Address" value={footer.address || ""} onChange={v => handleFooterChange("address", v)} type="textarea" rows={2} />
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-6">
                                <h4 className="text-sm font-bold border-b border-gray-200 pb-2">Footer Navigation Lists</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                                    <LinkBuilder state={footer} setState={setFooter} stateKey="company_links" title="Column 1: Quick Links" />
                                    <LinkBuilder state={footer} setState={setFooter} stateKey="legal_links" title="Column 2: Legal Links" />
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <Field label="Copyright Text" value={footer.copyright_text || "© {year} First Bencher."} onChange={v => handleFooterChange("copyright_text", v)} />
                                    <p className="text-[11px] text-gray-500 mt-1">Use `{"{year}"}` to automatically insert the current year.</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                    <h4 className="text-sm font-bold">Social Media Profiles</h4>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <input type="checkbox" checked={footer.show_socials ?? true} onChange={e => handleFooterChange("show_socials", e.target.checked)} className="w-4 h-4 rounded text-[#a60303]" /> Show Icons
                                    </label>
                                </div>
                                {footer.show_socials !== false && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <Field label="Facebook URL" value={footer.facebook_url || ""} onChange={v => handleFooterChange("facebook_url", v)} type="url" />
                                        <Field label="Twitter / X URL" value={footer.twitter_url || ""} onChange={v => handleFooterChange("twitter_url", v)} type="url" />
                                        <Field label="LinkedIn URL" value={footer.linkedin_url || ""} onChange={v => handleFooterChange("linkedin_url", v)} type="url" />
                                        <Field label="Instagram URL" value={footer.instagram_url || ""} onChange={v => handleFooterChange("instagram_url", v)} type="url" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Shared UI Utilities ────────────────────────────────────────

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
        <div className="space-y-1.5 flex-1">
            {label && <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>}
            {type === "textarea" ? (
                <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cn(base, "resize-none")} />
            ) : (
                <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
            )}
        </div>
    );
}

function ColorPicker({ configKey, label, value, onChange }: { configKey: keyof GlobalSettings, label: string, value: string, onChange: any }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1 pr-3 focus-within:ring-2 focus-within:ring-red-100 focus-within:border-[#a60303]">
                <input type="color" value={value || "#000000"} onChange={(e) => onChange(configKey, e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                <input type="text" value={value} onChange={(e) => onChange(configKey, e.target.value)} className="flex-1 outline-none text-sm font-mono text-gray-600 uppercase" maxLength={7} />
            </div>
        </div>
    );
}

function LinkBuilder({ state, setState, stateKey, title }: { state: any, setState: any, stateKey: string, title: string }) {
    const links = (state[stateKey] as Array<any>) || [];
    return (
        <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col gap-3">
            <h5 className="text-xs font-bold uppercase text-gray-500 mb-1">{title}</h5>
            <Reorder.Group axis="y" values={links} onReorder={(val) => setState((p: any) => ({ ...p, [stateKey]: val }))} className="space-y-3">
            {links.map((lnk, idx) => {
                return (
                <Reorder.Item key={lnk._id || `${stateKey}-${idx}`} value={lnk} className="flex gap-2 items-center bg-gray-50 p-2 pr-4 pl-3 rounded-lg border border-gray-100 shadow-sm relative group">
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-[#a60303] transition-colors p-1 rounded-md">
                        <GripVertical size={16} />
                    </div>
                    <div className="flex-1 flex gap-2 items-end">
                        <Field value={lnk.name} onChange={(v: string) => { const n = [...links]; n[idx].name = v; setState((p: any) => ({...p, [stateKey]: n })); }} placeholder="Name" />
                        <Field value={lnk.href} onChange={(v: string) => { const n = [...links]; n[idx].href = v; setState((p: any) => ({...p, [stateKey]: n })); }} placeholder="URL" />
                        <button onClick={() => setState((p: any) => ({...p, [stateKey]: links.filter((_, i) => i !== idx)}))} className="pb-2 text-red-400 p-1 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                </Reorder.Item>
                );
            })}
            </Reorder.Group>
            <button onClick={() => setState((p: any) => ({...p, [stateKey]: [...links, { name: "", href: "", _id: Math.random().toString(36).slice(2) }]}))} className="text-xs font-bold text-[#a60303] hover:underline self-start mt-1">
                + Add Link
            </button>
        </div>
    );
}
