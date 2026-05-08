"use client";

import React, { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

const defaultForm = { name: "", email: "", phone: "", subject: "", message: "" };
const inp = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";

export default function ContactForm() {
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const set = (k: keyof typeof defaultForm, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            setError("Please fill in all required fields.");
            return;
        }
        setError("");
        setSubmitting(true);

        const supabase = createClient();
        const { error: dbError } = await supabase.from("inquiries").insert([{
            full_name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            subject: form.subject.trim() || "Contact Form",
            message: form.message.trim(),
            status: "pending",
        }]);

        if (dbError) {
            setError("Something went wrong. Please try again.");
            setSubmitting(false);
            return;
        }

        try {
            await fetch("/api/mail/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "contact",
                    data: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), subject: form.subject.trim(), message: form.message.trim() },
                }),
            });
        } catch {
            // Non-fatal: DB record was saved; email notification failure is acceptable
        }

        setSubmitting(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center gap-4 text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <div>
                    <p className="font-black text-xl text-gray-900">Message Sent!</p>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                        Thank you {form.name.split(" ")[0]}! We&apos;ve received your message and will get back to you within 1–2 business days.
                    </p>
                </div>
                <button onClick={() => { setForm(defaultForm); setSubmitted(false); }}
                    className="mt-2 text-sm text-primary font-bold hover:underline">
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input type="text" required className={inp} placeholder="John Doe" value={form.name} onChange={e => set("name", e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                    <input type="email" required className={inp} placeholder="john@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input type="tel" className={inp} placeholder="+1 (234) 567-8900" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                <input type="text" className={inp} placeholder="How can we help you?" value={form.subject} onChange={e => set("subject", e.target.value)} />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message *</label>
                <textarea rows={5} required className={inp + " resize-none"} placeholder="Tell us about your training needs..." value={form.message} onChange={e => set("message", e.target.value)} />
            </div>

            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

            <button type="submit" disabled={submitting}
                className="flex items-center justify-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-primary/30 hover:scale-105 transition-all text-sm disabled:opacity-60 disabled:scale-100">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={16} /> Send Message</>}
            </button>
        </form>
    );
}
