"use client";

import React, { useState } from "react";
import { Phone, Mail, MessageSquare, X } from "lucide-react";
import { useEnquiry } from "@/components/EnquiryModal";
import { cn } from "@/lib/utils";

interface Props {
    phone: string;
    email: string;
}

export default function FloatingContactWidget({ phone, email }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const { openEnquiry } = useEnquiry();

    return (
        <>
            {/* ── Desktop: right-edge sliding tab (lg+) ─────────── */}
            <div className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-50 items-center">
                {/* Slide-out panel */}
                <div
                    className={cn(
                        "bg-white border border-gray-200 border-r-0 shadow-2xl shadow-gray-300/50 transition-all duration-300 ease-in-out overflow-hidden",
                        isOpen ? "w-72 opacity-100" : "w-0 opacity-0 pointer-events-none"
                    )}
                >
                    <div className="w-72 p-5 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-black text-base text-gray-900">Need Help?</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#a60303] hover:border-red-200 transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Our advisors are ready to help you choose the right program.
                        </p>

                        {/* Call */}
                        <a
                            href={`tel:${phone}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
                        >
                            <div className="w-9 h-9 bg-[#a60303] rounded-lg flex items-center justify-center shrink-0">
                                <Phone size={15} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Call Us</p>
                                <p className="font-black text-gray-900 text-xs">{phone}</p>
                            </div>
                        </a>

                        {/* Email */}
                        <a
                            href={`mailto:${email}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
                        >
                            <div className="w-9 h-9 bg-[#800202] rounded-lg flex items-center justify-center shrink-0">
                                <Mail size={15} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Email Us</p>
                                <p className="font-black text-gray-900 text-xs break-all">{email}</p>
                            </div>
                        </a>

                        {/* Callback */}
                        <button
                            onClick={() => { openEnquiry("Contact Us — Callback Request"); setIsOpen(false); }}
                            className="w-full bg-[#a60303] hover:bg-[#800202] text-white py-2.5 font-bold text-xs transition-colors shadow-md shadow-red-900/20 flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={13} />
                            Request a Callback
                        </button>

                        <p className="text-[10px] text-center text-gray-400">
                            We&apos;ll get back to you within 24 hours
                        </p>
                    </div>
                </div>

                {/* Vertical tab button */}
                <button
                    onClick={() => setIsOpen(prev => !prev)}
                    aria-label={isOpen ? "Close contact panel" : "Open contact panel"}
                    className={cn(
                        "flex flex-col items-center gap-2 py-5 px-3 text-white font-black text-[10px] uppercase tracking-widest shadow-xl transition-all duration-200",
                        isOpen ? "bg-[#800202]" : "bg-[#a60303] hover:bg-[#800202]"
                    )}
                    style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                >
                    <Phone size={15} className="rotate-[90deg] shrink-0" style={{ writingMode: "horizontal-tb" }} />
                    <span>Contact Us</span>
                </button>
            </div>

            {/* ── Mobile / Tablet: floating button + slide-up panel (< lg) ── */}
            <div className="lg:hidden">
                {/* Backdrop */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Slide-up panel */}
                <div
                    className={cn(
                        "fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl border-t border-gray-200 transition-transform duration-300 ease-in-out",
                        isOpen ? "translate-y-0" : "translate-y-full"
                    )}
                >
                    <div className="p-5 space-y-3 max-w-md mx-auto">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-black text-base text-gray-900">Need Help?</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#a60303] transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <a
                            href={`tel:${phone}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
                        >
                            <div className="w-10 h-10 bg-[#a60303] rounded-lg flex items-center justify-center shrink-0">
                                <Phone size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Call Us</p>
                                <p className="font-black text-gray-900 text-sm">{phone}</p>
                            </div>
                        </a>

                        <a
                            href={`mailto:${email}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
                        >
                            <div className="w-10 h-10 bg-[#800202] rounded-lg flex items-center justify-center shrink-0">
                                <Mail size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Email Us</p>
                                <p className="font-black text-gray-900 text-sm">{email}</p>
                            </div>
                        </a>

                        <button
                            onClick={() => { openEnquiry("Contact Us — Callback Request"); setIsOpen(false); }}
                            className="w-full bg-[#a60303] hover:bg-[#800202] text-white py-3 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={15} />
                            Request a Callback
                        </button>
                    </div>
                </div>

                {/* Floating phone button */}
                <button
                    onClick={() => setIsOpen(prev => !prev)}
                    aria-label="Contact us"
                    className={cn(
                        "fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200",
                        isOpen ? "bg-[#800202] rotate-12" : "bg-[#a60303] hover:bg-[#800202]"
                    )}
                >
                    {isOpen ? <X size={22} className="text-white" /> : <Phone size={22} className="text-white" />}
                </button>
            </div>
        </>
    );
}
