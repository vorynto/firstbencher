"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Save, Loader2, CheckCircle2, Mail, Server, Eye, EyeOff,
    Send, AlertCircle, ShieldCheck, Inbox
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type MailSettings = {
    admin_email: string;
    from_email: string;
    from_name: string;
    smtp_host: string;
    smtp_port: string;
    smtp_user: string;
    smtp_password: string;
    smtp_encryption: string;
    imap_host: string;
    imap_port: string;
    imap_user: string;
    imap_password: string;
    imap_encryption: string;
    imap_protocol: string;
};

const defaults: MailSettings = {
    admin_email: "", from_email: "", from_name: "First Bencher",
    smtp_host: "", smtp_port: "587", smtp_user: "", smtp_password: "", smtp_encryption: "tls",
    imap_host: "", imap_port: "993", imap_user: "", imap_password: "", imap_encryption: "ssl", imap_protocol: "imap",
};

const TABS = [
    { id: "general", label: "General", icon: Mail },
    { id: "smtp", label: "SMTP (Outgoing)", icon: Send },
    { id: "imap", label: "IMAP / POP (Incoming)", icon: Inbox },
] as const;

type Tab = typeof TABS[number]["id"];

function Label({ children }: { children: React.ReactNode }) {
    return <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{children}</label>;
}

const inp = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all bg-white";

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input type={show ? "text" : "password"} className={inp + " pr-10"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}

export default function MailSettingsPage() {
    const supabase = useMemo(() => createClient(), []);
    const [tab, setTab] = useState<Tab>("general");
    const [settings, setSettings] = useState<MailSettings>(defaults);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [testEmail, setTestEmail] = useState("");
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from("mail_settings").select("*").eq("id", 1).single();
            if (data) setSettings({ ...defaults, ...data, smtp_port: String(data.smtp_port || 587), imap_port: String(data.imap_port || 993) });
            setLoading(false);
        })();
    }, [supabase]);

    const set = (k: keyof MailSettings, v: string) => setSettings(s => ({ ...s, [k]: v }));

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        const { error } = await supabase.from("mail_settings").upsert({
            id: 1,
            ...settings,
            smtp_port: Number(settings.smtp_port) || 587,
            imap_port: Number(settings.imap_port) || 993,
            updated_at: new Date().toISOString(),
        });
        setSaving(false);
        if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
        else alert("Save failed: " + error.message);
    };

    const handleTest = async () => {
        if (!testEmail.trim()) { setTestResult({ ok: false, msg: "Enter a test email address." }); return; }
        setTesting(true);
        setTestResult(null);
        const res = await fetch("/api/mail/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "contact",
                data: { name: "Test User", email: testEmail, phone: "N/A", subject: "SMTP Test", message: "This is a test email from First Bencher admin panel." },
            }),
        });
        const json = await res.json();
        setTestResult(res.ok ? { ok: true, msg: "Test email sent successfully!" } : { ok: false, msg: json.error || "Send failed." });
        setTesting(false);
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-[var(--primary)]" size={28} />
        </div>
    );

    return (
        <div className="flex flex-col gap-8 max-w-3xl">
            <div>
                <h1 className="text-3xl font-black mb-1">Mail Settings</h1>
                <p className="text-muted-foreground text-sm">Configure email notifications for enquiries, applications, and contact forms.</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all", tab === t.id ? "bg-white text-[var(--primary)] shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                        <t.icon size={15} /> {t.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-7 flex flex-col gap-6">

                {/* ── General ── */}
                {tab === "general" && (
                    <>
                        <div>
                            <h2 className="font-black text-gray-900 mb-1 flex items-center gap-2"><Mail size={18} className="text-[var(--primary)]" /> General Email Settings</h2>
                            <p className="text-sm text-gray-500">Set the recipient for all admin notifications and the sender details.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="p-4 bg-primary-tint border border-[var(--primary)]/20 rounded-xl flex gap-3">
                                <ShieldCheck size={18} className="text-[var(--primary)] shrink-0 mt-0.5" />
                                <p className="text-xs text-[var(--primary)] font-semibold leading-relaxed">
                                    Admin email receives notifications for all enquiries, enrollments, contact submissions, and job applications.
                                </p>
                            </div>

                            <div>
                                <Label>Admin Email (Notification Recipient) *</Label>
                                <input className={inp} type="email" value={settings.admin_email} onChange={e => set("admin_email", e.target.value)} placeholder="admin@firstbencher.com" />
                                <p className="text-xs text-gray-400 mt-1">All form submission alerts go to this address.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>From Email Address *</Label>
                                    <input className={inp} type="email" value={settings.from_email} onChange={e => set("from_email", e.target.value)} placeholder="no-reply@firstbencher.com" />
                                </div>
                                <div>
                                    <Label>From Display Name</Label>
                                    <input className={inp} value={settings.from_name} onChange={e => set("from_name", e.target.value)} placeholder="First Bencher" />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── SMTP ── */}
                {tab === "smtp" && (
                    <>
                        <div>
                            <h2 className="font-black text-gray-900 mb-1 flex items-center gap-2"><Send size={18} className="text-[var(--primary)]" /> SMTP Configuration</h2>
                            <p className="text-sm text-gray-500">Outgoing mail server settings — used to send all emails.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <Label>SMTP Host *</Label>
                                <input className={inp} value={settings.smtp_host} onChange={e => set("smtp_host", e.target.value)} placeholder="smtp.gmail.com" />
                            </div>
                            <div>
                                <Label>SMTP Port</Label>
                                <input className={inp} type="number" value={settings.smtp_port} onChange={e => set("smtp_port", e.target.value)} placeholder="587" />
                                <p className="text-xs text-gray-400 mt-1">TLS: 587 · SSL: 465 · None: 25</p>
                            </div>
                            <div>
                                <Label>Encryption</Label>
                                <select className={inp} value={settings.smtp_encryption} onChange={e => set("smtp_encryption", e.target.value)}>
                                    <option value="tls">TLS (Recommended)</option>
                                    <option value="ssl">SSL</option>
                                    <option value="none">None</option>
                                </select>
                            </div>
                            <div>
                                <Label>SMTP Username</Label>
                                <input className={inp} value={settings.smtp_user} onChange={e => set("smtp_user", e.target.value)} placeholder="your@email.com" />
                            </div>
                            <div>
                                <Label>SMTP Password</Label>
                                <PasswordInput value={settings.smtp_password} onChange={v => set("smtp_password", v)} placeholder="App password or SMTP password" />
                            </div>
                            <div>
                                <Label>From Email Address *</Label>
                                <input className={inp} type="email" value={settings.from_email} onChange={e => set("from_email", e.target.value)} placeholder="no-reply@firstbencher.com" />
                                <p className="text-xs text-gray-400 mt-1">The address emails are sent from.</p>
                            </div>
                            <div>
                                <Label>From Display Name</Label>
                                <input className={inp} value={settings.from_name} onChange={e => set("from_name", e.target.value)} placeholder="First Bencher" />
                                <p className="text-xs text-gray-400 mt-1">Name shown in the recipient&apos;s inbox.</p>
                            </div>
                        </div>

                        {/* Test email */}
                        <div className="border border-gray-100 rounded-xl p-5 bg-gray-50 flex flex-col gap-3">
                            <p className="text-sm font-black text-gray-700">Test SMTP Connection</p>
                            <p className="text-xs text-gray-500">Save settings first, then send a test email to verify the configuration.</p>
                            <div className="flex gap-2">
                                <input className={inp} type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="Enter email to receive test" />
                                <button onClick={handleTest} disabled={testing} className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-60 shrink-0 flex items-center gap-2">
                                    {testing ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send Test</>}
                                </button>
                            </div>
                            {testResult && (
                                <div className={cn("flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg", testResult.ok ? "bg-green-50 text-green-700" : "bg-primary-tint text-red-600")}>
                                    {testResult.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                                    {testResult.msg}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <p className="text-xs font-black text-blue-700 mb-1">Gmail / Google Workspace</p>
                            <p className="text-xs text-blue-600 leading-relaxed">Use <strong>smtp.gmail.com</strong>, port <strong>587</strong>, TLS. For the password, use a Google App Password (not your regular password) — generate one at myaccount.google.com → Security → App passwords.</p>
                        </div>
                    </>
                )}

                {/* ── IMAP / POP ── */}
                {tab === "imap" && (
                    <>
                        <div>
                            <h2 className="font-black text-gray-900 mb-1 flex items-center gap-2"><Inbox size={18} className="text-[var(--primary)]" /> IMAP / POP Configuration</h2>
                            <p className="text-sm text-gray-500">Incoming mail settings — used to receive reply emails in your mail client.</p>
                        </div>

                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
                            <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-700 leading-relaxed font-semibold">
                                These settings are for reference and for connecting your mail client (Outlook, Thunderbird, Apple Mail) to receive replies. They do not affect email sending.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <Label>Protocol</Label>
                                <select className={inp} value={settings.imap_protocol} onChange={e => set("imap_protocol", e.target.value)}>
                                    <option value="imap">IMAP (Recommended)</option>
                                    <option value="pop3">POP3</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <Label>{settings.imap_protocol.toUpperCase()} Host</Label>
                                <input className={inp} value={settings.imap_host} onChange={e => set("imap_host", e.target.value)} placeholder={settings.imap_protocol === "imap" ? "imap.gmail.com" : "pop.gmail.com"} />
                            </div>
                            <div>
                                <Label>Port</Label>
                                <input className={inp} type="number" value={settings.imap_port} onChange={e => set("imap_port", e.target.value)} placeholder="993" />
                                <p className="text-xs text-gray-400 mt-1">IMAP SSL: 993 · IMAP TLS: 143 · POP3 SSL: 995</p>
                            </div>
                            <div>
                                <Label>Encryption</Label>
                                <select className={inp} value={settings.imap_encryption} onChange={e => set("imap_encryption", e.target.value)}>
                                    <option value="ssl">SSL</option>
                                    <option value="tls">TLS/STARTTLS</option>
                                    <option value="none">None</option>
                                </select>
                            </div>
                            <div>
                                <Label>Username</Label>
                                <input className={inp} value={settings.imap_user} onChange={e => set("imap_user", e.target.value)} placeholder="your@email.com" />
                            </div>
                            <div>
                                <Label>Password</Label>
                                <PasswordInput value={settings.imap_password} onChange={v => set("imap_password", v)} placeholder="Password or App Password" />
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                            <p className="text-xs font-black text-gray-700 mb-2">Gmail IMAP Settings</p>
                            <div className="space-y-1 text-xs text-gray-600">
                                {[["Host", "imap.gmail.com"], ["Port", "993"], ["Encryption", "SSL"], ["Username", "your Gmail address"], ["Password", "App Password"]].map(([k, v]) => (
                                    <div key={k} className="flex gap-3"><span className="font-semibold w-24 shrink-0">{k}</span><span>{v}</span></div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="bg-[var(--primary)] text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-60 flex items-center gap-2">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save Settings</>}
                </button>
                {saved && (
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                        <CheckCircle2 size={16} /> Settings saved!
                    </div>
                )}
            </div>

            {/* What triggers emails */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="font-black text-gray-900 mb-4 flex items-center gap-2"><Server size={16} className="text-[var(--primary)]" /> Email Triggers</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        ["Course Enquiry", "When someone enquires about a course — admin notified + confirmation to user"],
                        ["Enroll Now", "Workshop/course enrollment — admin notified + confirmation to user"],
                        ["Contact Form", "Website contact page submission — admin notified + confirmation to user"],
                        ["Job Application", "Career portal application — admin notified + confirmation to applicant"],
                    ].map(([title, desc]) => (
                        <div key={title} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-black text-gray-900">{title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
