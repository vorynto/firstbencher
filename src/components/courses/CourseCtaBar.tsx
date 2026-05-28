"use client";

import React from "react";
import { PhoneCall, Phone, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { useEnquiry } from "@/components/EnquiryModal";

export default function CourseCtaBar({ courseTitle, visible = true }: { courseTitle?: string; visible?: boolean }) {
    const { openEnquiry } = useEnquiry();
    const source = courseTitle ? courseTitle : "Course Page";

    return (
        <div className={`sticky bottom-0 left-0 right-0 z-50 bg-[#1a202c] border-t border-white/10 shadow-2xl shadow-black/50 transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}>
            <div className="max-w-7xl mx-auto flex items-stretch divide-x divide-white/10">
                {/* Request Callback */}
                <button
                    onClick={() => openEnquiry(`Request Callback — ${source}`)}
                    className="flex flex-1 items-center justify-center gap-2.5 py-4 text-white hover:bg-white/5 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 group-hover:bg-[var(--primary)]/40 flex items-center justify-center transition-colors">
                        <PhoneCall size={15} className="text-[var(--primary)]" />
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-[11px] text-gray-400 font-medium leading-none mb-0.5">Need help?</p>
                        <p className="text-sm font-black leading-none">Request a Callback</p>
                    </div>
                    <p className="text-xs font-bold sm:hidden">Callback</p>
                </button>

                {/* Call Us */}
                <a href="tel:+1234567890" className="flex flex-1 items-center justify-center gap-2.5 py-4 text-white hover:bg-white/5 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 group-hover:bg-green-500/40 flex items-center justify-center transition-colors">
                        <Phone size={15} className="text-green-400" />
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-[11px] text-gray-400 font-medium leading-none mb-0.5">Speak to us</p>
                        <p className="text-sm font-black leading-none">Call Us</p>
                    </div>
                    <p className="text-xs font-bold sm:hidden">Call Us</p>
                </a>

                {/* Email Us */}
                <a href="mailto:info@firstbencher.com" className="flex flex-1 items-center justify-center gap-2.5 py-4 text-white hover:bg-white/5 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 group-hover:bg-[var(--primary)]/40 flex items-center justify-center transition-colors">
                        <Mail size={15} className="text-red-400" />
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-[11px] text-gray-400 font-medium leading-none mb-0.5">Send a message</p>
                        <p className="text-sm font-black leading-none">Email Us</p>
                    </div>
                    <p className="text-xs font-bold sm:hidden">Email Us</p>
                </a>

                {/* Enroll Now */}
                <div className="flex-1 flex items-stretch">
                    <Button
                        onClick={() => openEnquiry(`Enroll Now — ${source}`)}
                        className="w-full font-black text-sm px-6 rounded-none"
                    >
                        <span className="hidden sm:inline">Enroll</span> Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
