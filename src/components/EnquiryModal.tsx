"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase";

// ── Context ────────────────────────────────────────────────────

type EnquiryContextType = {
    openEnquiry: (source: string) => void;
};

const EnquiryContext = createContext<EnquiryContextType>({ openEnquiry: () => {} });

export function useEnquiry() {
    return useContext(EnquiryContext);
}

// ── Provider ───────────────────────────────────────────────────

const defaultForm = { name: "", email: "", phone: "", message: "" };

export function EnquiryProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const [open, setOpen] = useState(false);
    const [source, setSource] = useState("");
    const [formData, setFormData] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState("");

    const openEnquiry = useCallback((src: string) => {
        setSource(src);
        setSubmitted(false);
        setFormData(defaultForm);
        setFormError("");
        setOpen(true);
    }, []);

    const close = () => setOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
            setFormError("Please fill in all required fields.");
            return;
        }
        setFormError("");
        setSubmitting(true);
        const { error } = await supabase.from("inquiries").insert([{
            full_name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            subject: source,
            message: formData.message.trim() || `Enquiry submitted via: ${source}`,
            status: "pending",
        }]);
        setSubmitting(false);
        if (error) {
            setFormError("Something went wrong. Please try again.");
        } else {
            setSubmitted(true);
            fetch("/api/mail/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "enquiry",
                    data: { name: formData.name.trim(), email: formData.email.trim(), phone: formData.phone.trim(), source, message: formData.message.trim() },
                }),
            }).catch(() => {});
        }
    };

    return (
        <EnquiryContext.Provider value={{ openEnquiry }}>
            {children}

            {open && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    onClick={close}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <div
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-[var(--primary)] px-6 py-5 flex items-start justify-between">
                            <div>
                                <h3 className="text-white font-black text-xl">Enquire Now</h3>
                                <p className="text-red-200 text-xs mt-0.5 line-clamp-1 max-w-[300px]">{source}</p>
                            </div>
                            <button
                                onClick={close}
                                className="text-white/70 hover:text-white transition-colors p-1 -mt-0.5 -mr-1 shrink-0"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {submitted ? (
                            <div className="p-10 flex flex-col items-center gap-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-green-500" />
                                </div>
                                <div>
                                    <p className="font-black text-[#1a202c] text-xl">Thank You!</p>
                                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                                        Your enquiry has been received.<br />Our team will contact you within 24 hours.
                                    </p>
                                </div>
                                <button
                                    onClick={close}
                                    className="mt-2 bg-[var(--primary)] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--primary-dark)] transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <InputField
                                    label="Full Name *"
                                    type="text"
                                    value={formData.name}
                                    onChange={v => setFormData(p => ({ ...p, name: v }))}
                                    placeholder="e.g. John Smith"
                                    required
                                />
                                <InputField
                                    label="Email Address *"
                                    type="email"
                                    value={formData.email}
                                    onChange={v => setFormData(p => ({ ...p, email: v }))}
                                    placeholder="e.g. john@example.com"
                                    required
                                />
                                <InputField
                                    label="Phone Number *"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={v => setFormData(p => ({ ...p, phone: v }))}
                                    placeholder="e.g. +1 234 567 8900"
                                    required
                                />
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Message{" "}
                                        <span className="normal-case font-normal text-gray-400">(optional)</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.message}
                                        onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                                        placeholder="Any specific questions or requirements..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 resize-none transition-all"
                                    />
                                </div>

                                {formError && (
                                    <p className="text-red-500 text-xs font-semibold">{formError}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white py-3.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                                    ) : (
                                        <><Send size={16} /> Send Enquiry</>
                                    )}
                                </button>
                                <p className="text-[11px] text-center text-gray-400">
                                    We respect your privacy. No spam, ever.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </EnquiryContext.Provider>
    );
}

// ── Shared input ───────────────────────────────────────────────

function InputField({
    label, type, value, onChange, placeholder, required,
}: {
    label: string; type: string; value: string;
    onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <input
                type={type}
                required={required}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
        </div>
    );
}
