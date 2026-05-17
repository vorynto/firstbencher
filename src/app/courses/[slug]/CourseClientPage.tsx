"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Phone, Mail, CheckCircle2, Star, Clock,
    Users, Award, ChevronDown, ChevronUp,
    Globe, Calendar, MapPin, Loader2, Send,
    ChevronLeft, ChevronRight, UserCircle2, Youtube
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useEnquiry } from "@/components/EnquiryModal";
import CourseCtaBar from "@/components/courses/CourseCtaBar";
import { sanitize } from "@/lib/sanitize";

type Instructor = {
    id: string;
    name: string;
    title: string;
    description: string;
    qualifications: string[];
    rating: number;
    review_count: number;
    profile_image_url: string;
};

type Course = {
    id: string;
    title: string;
    slug: string;
    description?: string;
    short_description?: string;
    image_url?: string;
    price?: number | null;
    duration?: string;
    category?: string;
    rating?: number;
    review_count?: number;
    features?: string[];
    requirements?: string;
    curriculum?: { title: string; lessons: string[] }[];
    faq?: { question: string; answer: string }[];
    tags?: string[];
    batches?: any[];
    videos?: { title: string; url: string }[];
    tabs_enabled?: {
        overview?: boolean;
        training_dates?: boolean;
        key_features?: boolean;
        curriculum?: boolean;
        eligibility?: boolean;
        faq?: boolean;
        instructors?: boolean;
        videos?: boolean;
    };
};

const ALL_TABS = [
    { id: "overview",       label: "Overview",        key: "overview" },
    { id: "training-dates", label: "Training Dates",  key: "training_dates" },
    { id: "key-features",   label: "Key Features",    key: "key_features" },
    { id: "curriculum",     label: "Curriculum",      key: "curriculum" },
    { id: "eligibility",    label: "Eligibility",     key: "eligibility" },
    { id: "faq",            label: "FAQs",            key: "faq" },
    { id: "instructors",    label: "Instructors",     key: "instructors" },
    { id: "videos",         label: "Videos",          key: "videos" },
];

const defaultForm = { name: "", email: "", phone: "", message: "" };

export default function CourseClientPage({ course, instructors = [] }: { course: Course; instructors?: Instructor[] }) {
    const supabase = createClient();
    const { openEnquiry } = useEnquiry();

    const [activeTab, setActiveTab] = useState("overview");
    const [stickyNavVisible, setStickyNavVisible] = useState(false);
    const [openCurriculum, setOpenCurriculum] = useState<number | null>(0);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [isFormFixed, setIsFormFixed] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const tabsContainerRef = useRef<HTMLElement>(null);

    // Inline hero card enquiry form state
    const [formData, setFormData] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState("");

    const handleEnquiry = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone) {
            setFormError("Please fill in all required fields.");
            return;
        }
        setFormError("");
        setSubmitting(true);
        const { error } = await supabase.from("inquiries").insert([{
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: `Course Enquiry — ${course.title}`,
            message: formData.message || `Enquiry about ${course.title}`,
            status: "pending",
        }]);
        setSubmitting(false);
        if (error) {
            setFormError("Something went wrong. Please try again.");
        } else {
            setSubmitted(true);
            setFormData(defaultForm);
        }
    };

    useEffect(() => {
        if (activeTab && tabsContainerRef.current) {
            const activeBtn = document.getElementById(`tab-btn-${activeTab}`);
            if (activeBtn) {
                const container = tabsContainerRef.current;
                const scrollLeft = activeBtn.offsetLeft - (container.clientWidth / 2) + (activeBtn.clientWidth / 2);
                container.scrollTo({ left: scrollLeft, behavior: "smooth" });
            }
        }
    }, [activeTab]);

    useEffect(() => {
        const handleScroll = () => {
            if (!heroRef.current) return;
            const heroBottom = heroRef.current.getBoundingClientRect().bottom;
            const heroPast = heroBottom <= 0;
            setStickyNavVisible(heroPast);

            // Fix the enquiry form to the right side once hero is scrolled past,
            // until the sentinel (placed before the footer) enters the viewport.
            if (heroPast && sentinelRef.current) {
                const sentinelTop = sentinelRef.current.getBoundingClientRect().top;
                setIsFormFixed(sentinelTop > window.innerHeight);
            } else {
                setIsFormFixed(false);
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const globalHeader = document.querySelector("header.fixed.top-0");
        if (globalHeader instanceof HTMLElement) {
            globalHeader.style.display = stickyNavVisible ? "none" : "block";
        }
        return () => {
            if (globalHeader instanceof HTMLElement) globalHeader.style.display = "block";
        };
    }, [stickyNavVisible]);

    useEffect(() => {
        const sections = TABS.map(t => document.getElementById(t.id)).filter(Boolean);
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveTab(entry.target.id);
                });
            },
            { rootMargin: "-30% 0px -60% 0px" }
        );
        sections.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    const { title, category, short_description, description, rating, review_count, features, requirements, curriculum, faq, batches, videos, tabs_enabled } = course;

    const te = tabs_enabled || {};
    const TABS = ALL_TABS.filter(t => te[t.key as keyof typeof te] !== false);

    return (
        <div className="min-h-screen bg-gray-50 text-[#1a202c]">

            {/* ── HERO SECTION ─────────────────────────────────────────── */}
            <div ref={heroRef} className="bg-[#111111]">
                <div className="max-w-375 mx-auto px-4 sm:px-10 py-14 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-start">

                    {/* Left: Text */}
                    <div className="text-white space-y-7">
                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-1.5 text-xs text-red-300 font-medium flex-wrap">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span className="opacity-50">›</span>
                            <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
                            {category && (
                                <>
                                    <span className="opacity-50">›</span>
                                    <Link href={`/courses?cat=${encodeURIComponent(category)}`} className="hover:text-white transition-colors">{category}</Link>
                                </>
                            )}
                            <span className="opacity-50">›</span>
                            <span className="text-white/80 line-clamp-1">{title}</span>
                        </nav>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl xl:text-5xl font-black leading-tight">{title}</h1>

                        {/* Subtitle */}
                        {short_description && (
                            <p className="text-red-100/90 text-base md:text-lg leading-relaxed max-w-2xl">{short_description}</p>
                        )}

                        {/* Feature points — first 5 in left col, next 5 in right col */}
                        {features && features.length > 0 && (
                            <div className="flex flex-col sm:flex-row gap-y-2 sm:gap-x-8 pt-1">
                                {[features.slice(0, 5), features.slice(5, 10)].map((group, gi) => (
                                    group.length > 0 && (
                                        <div key={gi} className="flex flex-col gap-y-2.5 flex-1">
                                            {group.map((feat, i) => (
                                                <div key={i} className="flex items-start gap-2.5">
                                                    <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={16} />
                                                    <span className="text-red-50 text-sm leading-snug">{feat}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Inline Enquiry Form */}
                    <div className="relative">
                        <div className="bg-white shadow-2xl shadow-black/30 overflow-hidden">
                            <div className="bg-[#a60303] px-5 py-3.5">
                                <h3 className="text-white font-black text-lg">Enquiry Form</h3>
                            </div>

                            {submitted ? (
                                <div className="p-8 flex flex-col items-center gap-4 text-center">
                                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                                        <CheckCircle2 size={32} className="text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-black text-[#1a202c] text-lg">Enquiry Received!</p>
                                        <p className="text-gray-500 text-sm mt-1">Our team will contact you shortly.</p>
                                    </div>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="text-sm text-[#a60303] font-bold hover:underline mt-2"
                                    >
                                        Submit another enquiry
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleEnquiry} className="p-5 space-y-3">
                                    {[
                                        { label: "Full Name *", type: "text", key: "name", placeholder: "e.g. John Smith" },
                                        { label: "Email Address *", type: "email", key: "email", placeholder: "e.g. john@example.com" },
                                        { label: "Phone Number *", type: "tel", key: "phone", placeholder: "e.g. +1 234 567 8900" },
                                    ].map(({ label, type, key, placeholder }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                                            <input
                                                type={type}
                                                required
                                                value={formData[key as keyof typeof formData]}
                                                onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                                                placeholder={placeholder}
                                                className="w-full px-3 py-2 rounded border border-gray-200 text-sm outline-none focus:border-[#a60303] focus:ring-2 focus:ring-red-100 transition-all"
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Message <span className="normal-case font-normal text-gray-400">(optional)</span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.message}
                                            onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                                            placeholder="Any specific questions or requirements..."
                                            className="w-full px-3 py-2 rounded border border-gray-200 text-sm outline-none focus:border-[#a60303] focus:ring-2 focus:ring-red-100 resize-none transition-all"
                                        />
                                    </div>
                                    {formError && <p className="text-red-500 text-xs font-medium">{formError}</p>}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-[#a60303] hover:bg-[#800202] text-white py-2.5 font-bold text-sm transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {submitting
                                            ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                                            : <><Send size={16} /> Send Enquiry</>
                                        }
                                    </button>
                                    <p className="text-[11px] text-center text-gray-400">By submitting, you agree to be contacted by our team.</p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RED TRUST BAR ────────────────────────────────────────── */}
            <div className="bg-[#1d4ed8]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Review count + stars */}
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2.5">
                            {[1, 2, 3, 4, 5].map(i => (
                                <img
                                    key={i}
                                    src={`https://i.pravatar.cc/40?u=course-review-${i}`}
                                    alt=""
                                    className="w-9 h-9 rounded-full border-2 border-[#1d4ed8] object-cover"
                                />
                            ))}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className={i <= Math.round(rating ?? 5) ? "text-yellow-300 fill-yellow-300" : "text-white/30 fill-white/10"}
                                    />
                                ))}
                                {rating && (
                                    <span className="text-white font-black text-sm ml-1">{rating.toFixed(1)}</span>
                                )}
                            </div>
                            <p className="text-white/80 text-sm">
                                <strong className="text-white font-black">
                                    {review_count ? review_count.toLocaleString() : "10,000"}+
                                </strong>{" "}
                                Students Enrolled &amp; Rated
                            </p>
                        </div>
                    </div>

                    {/* Authorized Training Partner */}
                    <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-white/20 sm:pl-6 pt-4 sm:pt-0 w-full sm:w-auto justify-center sm:justify-start">
                        <div>
                            <div className="bg-white rounded-lg px-3 py-1.5 inline-flex items-center">
                                <img
                                    src="/pmi-atp-logo.png"
                                    alt="PMI Authorized Training Partner"
                                    className="h-14 object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── STICKY COURSE TAB NAV ─────────────────────────────────── */}
            <div className={`sticky top-0 z-60 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ${stickyNavVisible ? "block" : "hidden"}`}>
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                    <nav ref={tabsContainerRef} className="flex overflow-x-auto scrollbar-none">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                id={`tab-btn-${tab.id}`}
                                onClick={() => scrollToSection(tab.id)}
                                className={`relative px-5 py-4 text-sm font-bold whitespace-nowrap transition-colors shrink-0 ${
                                    activeTab === tab.id ? "text-[#a60303]" : "text-gray-500 hover:text-[#1a202c]"
                                }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a60303] rounded-full" />
                                )}
                            </button>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 shrink-0">
                        <button
                            onClick={() => openEnquiry(`Request Info — ${title}`)}
                            className="hidden sm:block border border-[#a60303] text-[#a60303] px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors whitespace-nowrap"
                        >
                            Request Info
                        </button>
                        <button
                            onClick={() => openEnquiry(`Enroll Now — ${title}`)}
                            className="hidden md:block bg-[#a60303] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#800202] transition-colors whitespace-nowrap"
                        >
                            Enroll Now
                        </button>
                    </div>
                </div>
            </div>

            {/* ── MAIN BODY ─────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">

                {/* LEFT CONTENT */}
                <div className="space-y-10">

                    {/* OVERVIEW */}
                    {te.overview !== false && <section id="overview" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <h2 className="text-2xl font-black text-[#1a202c] mb-5">Course Overview</h2>
                        {description ? (
                            <div
                                className="max-w-none text-gray-700 text-[16px] leading-[1.8]
                                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul_ul]:mb-0
                                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol_ol]:mb-0
                                [&_li]:mb-1.5
                                [&_p]:mb-4 [&_p:empty]:min-h-6 last:[&_p]:mb-0
                                [&_a]:text-[#a60303] [&_a]:underline
                                [&_h1]:text-2xl [&_h1]:font-black [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-[#1a202c]
                                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-[#1a202c]
                                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-[#1a202c]
                                [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:mb-4
                                [&_strong]:font-bold
                                [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4 [&_table]:text-sm
                                [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-bold [&_th]:text-gray-800
                                [&_td]:border [&_td]:border-gray-200 [&_td]:px-4 [&_td]:py-2.5 [&_td]:align-top [&_td]:text-gray-700
                                [&_tr:nth-child(even)_td]:bg-gray-50/60"
                                dangerouslySetInnerHTML={{
                                    __html: sanitize(description
                                        .replace(/<p>\s*(?:&nbsp;| |<br\s*\/?>)*\s*<\/p>/ig, '<p><br></p>')
                                        .replace(/&nbsp;| /g, ' '))
                                }}
                            />
                        ) : (
                            <p className="text-gray-500 italic leading-relaxed">
                                This comprehensive course covers everything you need to advance your career. Get industry-recognized certification and practical hands-on experience.
                            </p>
                        )}
                    </section>}

                    {/* TRAINING DATES */}
                    {te.training_dates !== false && batches && batches.length > 0 && (
                        <section id="training-dates" className="space-y-6">
                            <h2 className="text-2xl font-black text-[#1a202c]">Training Dates</h2>
                            <div className="space-y-6">
                                {batches.map((batch, i) => {
                                    const dateObj = new Date(batch.start_date);
                                    const day = isNaN(dateObj.getTime()) ? "-" : dateObj.getDate().toString().padStart(2, "0");
                                    const month = isNaN(dateObj.getTime()) ? "Mxx" : dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
                                    const year = isNaN(dateObj.getTime()) ? "xxxx" : dateObj.getFullYear();
                                    const batchLabel = `${title} — Batch starting ${month} ${year}`;

                                    return (
                                        <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row">
                                            <div className="bg-[#ffb0b0] shrink-0 w-full md:w-36 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-[#ffa1a1]">
                                                <span className="text-xs font-black uppercase text-[#1a202c]">START DATE</span>
                                                <span className="text-5xl font-black text-[#1a202c] mt-2 mb-1 leading-none">{day}</span>
                                                <span className="text-[13px] font-bold text-[#1a202c]">{month},{year}</span>
                                            </div>
                                            <div className="p-6 md:p-8 flex-1 flex flex-col gap-4">
                                                <h3 className="text-xl md:text-2xl font-black text-[#a60303] uppercase tracking-wide">
                                                    {title} TRAINING
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px] text-[#1a202c]">
                                                    <div className="flex items-center gap-2">
                                                        <Globe size={18} className="text-gray-600" />
                                                        <span>{batch.mode || "Classroom & Online Training"}</span>
                                                    </div>
                                                    <span className="hidden md:inline text-gray-400">|</span>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={18} className="text-gray-600" />
                                                        <span>{batch.classes ? batch.classes.join(" / ") : "5 Days / Weekends"}</span>
                                                    </div>
                                                    <span className="hidden md:inline text-gray-400">|</span>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={18} className="text-gray-600" />
                                                        <span>{batch.duration_hours || "8"} Hours Per Day</span>
                                                    </div>
                                                </div>

                                                {batch.batch_dates && batch.batch_dates.length > 0 && (
                                                    <div className="flex items-start gap-2 text-[15px] text-[#1a202c] mt-1">
                                                        <Calendar size={18} className="text-gray-600 shrink-0 mt-0.5" />
                                                        <span className="leading-relaxed font-medium">{batch.batch_dates.join(", ")}</span>
                                                    </div>
                                                )}

                                                {batch.locations && batch.locations.length > 0 && (
                                                    <div className="bg-transparent border border-[#faeaea] rounded-xl p-5 mt-2 shadow-sm">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <MapPin size={20} className="text-[#a60303]" />
                                                            <span className="font-bold text-[15px] text-[#1a202c]">Locations</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 w-full border-t border-l border-[#faeaea] rounded-lg overflow-hidden">
                                                            {batch.locations.map((loc: string, lIdx: number) => (
                                                                <div key={lIdx} className="bg-white text-[#a60303] font-bold text-[14px] px-3 py-3 text-center flex items-center justify-center border-b border-r border-[#faeaea]">
                                                                    {loc}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-4 mt-3">
                                                    <button
                                                        onClick={() => openEnquiry(`Enroll Now — ${batchLabel}`)}
                                                        className="bg-[#a60303] hover:bg-[#800202] text-white font-bold px-8 py-3 rounded-lg transition-colors min-w-36 shadow-sm"
                                                    >
                                                        Enroll Now
                                                    </button>
                                                    <button
                                                        onClick={() => openEnquiry(`Enquiry — ${batchLabel}`)}
                                                        className="bg-white hover:bg-red-50 text-[#a60303] border border-[#a60303] font-bold px-8 py-3 rounded-lg transition-colors min-w-36"
                                                    >
                                                        Enquiry Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* KEY FEATURES */}
                    {te.key_features !== false && <section id="key-features" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <h2 className="text-2xl font-black text-[#1a202c] mb-2">Key Features</h2>
                        <p className="text-gray-500 text-sm mb-6">What you&apos;ll gain from this program</p>
                        {features && features.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {features.map((feat, i) => (
                                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
                                        <span className="text-gray-700 text-sm font-medium leading-snug">{feat}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No specific features listed yet.</p>
                        )}
                    </section>}

                    {/* CURRICULUM */}
                    {te.curriculum !== false && <section id="curriculum" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <h2 className="text-2xl font-black text-[#1a202c] mb-2">Course Curriculum</h2>
                        <p className="text-gray-500 text-sm mb-6">Detailed breakdown of what&apos;s covered</p>
                        {curriculum && Array.isArray(curriculum) && curriculum.length > 0 ? (
                            <div className="space-y-3">
                                {curriculum.map((module, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setOpenCurriculum(openCurriculum === idx ? null : idx)}
                                            className="w-full flex items-center justify-between p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-7 h-7 rounded-full bg-red-50 text-[#a60303] text-xs font-black flex items-center justify-center shrink-0">{idx + 1}</span>
                                                <span className="font-bold text-[#1a202c] text-sm">{module.title}</span>
                                            </div>
                                            {openCurriculum === idx
                                                ? <ChevronUp size={18} className="text-gray-400 shrink-0" />
                                                : <ChevronDown size={18} className="text-gray-400 shrink-0" />
                                            }
                                        </button>
                                        {openCurriculum === idx && (
                                            <ul className="p-5 pt-3 space-y-2 border-t border-gray-100">
                                                {module.lessons && module.lessons.map((lesson: string, li: number) => (
                                                    <li key={li} className="flex items-start gap-2.5 text-sm text-gray-600">
                                                        <CheckCircle2 size={16} className="text-[#a60303] shrink-0 mt-0.5" />
                                                        {lesson}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 text-sm">
                                Curriculum details coming soon.
                            </div>
                        )}
                    </section>}

                    {/* ELIGIBILITY */}
                    {te.eligibility !== false && <section id="eligibility" className="rounded-2xl border border-red-100 shadow-sm p-8" style={{ background: "linear-gradient(135deg, #fff5f5 0%, #fff0f0 50%, #fff0f8 100%)" }}>
                        <h2 className="text-2xl font-black text-[#1a202c] mb-2">Eligibility & Prerequisites</h2>
                        <p className="text-gray-500 text-sm mb-6">Make sure you&apos;re prepared before enrolling</p>
                        {requirements ? (
                            <div
                                className="max-w-none text-gray-700 text-[16px] leading-[1.8]
                                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                                [&_li]:mb-1.5
                                [&_p]:mb-4 last:[&_p]:mb-0
                                [&_a]:text-[#a60303] [&_a]:underline
                                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2
                                [&_strong]:font-bold
                                [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4 [&_table]:text-sm
                                [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-bold [&_th]:text-gray-800
                                [&_td]:border [&_td]:border-gray-200 [&_td]:px-4 [&_td]:py-2.5 [&_td]:align-top [&_td]:text-gray-700
                                [&_tr:nth-child(even)_td]:bg-gray-50/60"
                                dangerouslySetInnerHTML={{ __html: sanitize(requirements) }}
                            />
                        ) : (
                            <p className="text-gray-500 italic">No specific prerequisites. This course is open to all skill levels.</p>
                        )}
                    </section>}

                    {/* FAQ */}
                    {te.faq !== false && <section id="faq" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <h2 className="text-2xl font-black text-[#1a202c] mb-6">Frequently Asked Questions</h2>
                        {faq && faq.length > 0 ? faq.map((item, i) => (
                            <div key={i} className={`border-b border-gray-100 ${i === 0 ? "" : "mt-4"}`}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between py-4 text-left"
                                >
                                    <span className="font-bold text-sm text-[#1a202c] pr-4">{item.question}</span>
                                    {openFaq === i
                                        ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                                        : <ChevronDown size={16} className="text-gray-400 shrink-0" />
                                    }
                                </button>
                                {openFaq === i && (
                                    <p className="text-gray-600 text-sm pb-4 leading-relaxed">{item.answer}</p>
                                )}
                            </div>
                        )) : (
                            <p className="text-gray-500 italic text-sm">No FAQs available yet.</p>
                        )}
                    </section>}

                    {/* INSTRUCTORS */}
                    {te.instructors !== false && instructors.length > 0 && (
                        <section id="instructors" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                            <h2 className="text-2xl font-black text-[#1a202c] mb-2">Meet Your Instructors</h2>
                            <p className="text-gray-500 text-sm mb-6">Learn from industry experts with real-world experience</p>
                            <InstructorCarousel instructors={instructors} />
                        </section>
                    )}

                    {/* VIDEOS */}
                    {te.videos !== false && videos && videos.length > 0 && (
                        <section id="videos" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <Youtube size={22} className="text-red-500" />
                                <h2 className="text-2xl font-black text-[#1a202c]">Course Videos</h2>
                            </div>
                            <p className="text-gray-500 text-sm mb-6">Watch free preview videos from this course</p>
                            <VideoSlider videos={videos} />
                        </section>
                    )}
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="hidden lg:block">
                    <div className="sticky top-[68px] space-y-6">

                        {/* "Have Questions?" — shown only before hero is scrolled past */}
                        {!isFormFixed && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                                <h3 className="font-black text-lg text-[#1a202c]">Have Questions?</h3>
                                <p className="text-gray-500 text-sm">Our advisors are ready to help you choose the right training path.</p>
                                <a href="tel:+1234567890" className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-200 transition-colors">
                                    <div className="w-10 h-10 bg-[#a60303] rounded-lg flex items-center justify-center shrink-0">
                                        <Phone size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium">Call Us</p>
                                        <p className="font-black text-[#1a202c] text-sm">+1 (234) 567-8900</p>
                                    </div>
                                </a>
                                <a href="mailto:info@firstbencher.com" className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-200 transition-colors">
                                    <div className="w-10 h-10 bg-[#800202] rounded-lg flex items-center justify-center shrink-0">
                                        <Mail size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium">Email Us</p>
                                        <p className="font-black text-[#1a202c] text-sm">info@firstbencher.com</p>
                                    </div>
                                </a>
                                <button
                                    onClick={() => openEnquiry(`Request Callback — ${title}`)}
                                    className="w-full bg-[#a60303] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#800202] transition-colors"
                                >
                                    Request a Callback
                                </button>
                            </div>
                        )}

                        {/* Course Highlights — always shown */}
                        <div className="bg-[#111111] rounded-2xl p-6 text-white">
                            <p className="text-red-200 text-xs font-bold uppercase tracking-wider mb-3">Course Highlights</p>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2 text-red-50"><Star size={14} className="text-yellow-400" fill="currentColor" /> Industry-recognized certification</li>
                                <li className="flex items-center gap-2 text-red-50"><Users size={14} className="text-[#a60303]" /> Expert-led live sessions</li>
                                <li className="flex items-center gap-2 text-red-50"><CheckCircle2 size={14} className="text-green-400" /> Hands-on projects &amp; real cases</li>
                                <li className="flex items-center gap-2 text-red-50"><Award size={14} className="text-yellow-400" /> Dedicated career support</li>
                            </ul>
                        </div>

                        {/* Enquiry Form — slides in after hero is scrolled past */}
                        {isFormFixed && (
                            <div
                                key="sidebar-enquiry"
                                className="animate-in fade-in slide-in-from-top-8 duration-500 bg-white overflow-hidden border border-gray-200 shadow-lg"
                            >
                                <div className="bg-[#a60303] px-5 py-3.5">
                                    <h3 className="text-white font-black text-lg">Enquiry Form</h3>
                                </div>

                                {submitted ? (
                                    <div className="p-8 flex flex-col items-center gap-4 text-center">
                                        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                                            <CheckCircle2 size={28} className="text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#1a202c] text-lg">Enquiry Received!</p>
                                            <p className="text-gray-500 text-sm mt-1">Our team will contact you shortly.</p>
                                        </div>
                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="text-sm text-[#a60303] font-bold hover:underline mt-2"
                                        >
                                            Submit another enquiry
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleEnquiry} className="p-5 space-y-3">
                                        {[
                                            { label: "Full Name *", type: "text", key: "name", placeholder: "e.g. John Smith" },
                                            { label: "Email Address *", type: "email", key: "email", placeholder: "e.g. john@example.com" },
                                            { label: "Phone Number *", type: "tel", key: "phone", placeholder: "e.g. +1 234 567 8900" },
                                        ].map(({ label, type, key, placeholder }) => (
                                            <div key={key}>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                                                <input
                                                    type={type}
                                                    required
                                                    value={formData[key as keyof typeof formData]}
                                                    onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                                                    placeholder={placeholder}
                                                    className="w-full px-3 py-2 rounded border border-gray-200 text-sm outline-none focus:border-[#a60303] focus:ring-2 focus:ring-red-100 transition-all"
                                                />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Message <span className="normal-case font-normal text-gray-400">(optional)</span>
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={formData.message}
                                                onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                                                placeholder="Any specific questions or requirements..."
                                                className="w-full px-3 py-2 rounded border border-gray-200 text-sm outline-none focus:border-[#a60303] focus:ring-2 focus:ring-red-100 resize-none transition-all"
                                            />
                                        </div>
                                        {formError && <p className="text-red-500 text-xs font-medium">{formError}</p>}
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-[#a60303] hover:bg-[#800202] text-white py-2.5 font-bold text-sm transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {submitting
                                                ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                                                : <><Send size={16} /> Send Enquiry</>
                                            }
                                        </button>
                                        <p className="text-[11px] text-center text-gray-400">By submitting, you agree to be contacted by our team.</p>
                                    </form>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Sentinel — enquiry form stops floating when this enters the viewport */}
            <div ref={sentinelRef} className="h-px" aria-hidden="true" />

            {/* Sticky bottom CTA bar */}
            <CourseCtaBar courseTitle={title} visible={stickyNavVisible} />

        </div>
    );
}

// ── InstructorCarousel ───────────────────────────────────────────

function InstructorCarousel({ instructors }: { instructors: Instructor[] }) {
    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent(i => (i - 1 + instructors.length) % instructors.length);
    const next = () => setCurrent(i => (i + 1) % instructors.length);

    const inst = instructors[current];
    const total = instructors.length;

    const formatReviews = (n: number) => {
        if (n >= 1000) return `${(n / 1000).toFixed(2)}k`;
        return String(n);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row gap-0 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">

                {/* Left: Photo + identity */}
                <div className="relative flex flex-col items-center pt-8 pb-6 px-6 bg-gray-50 md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-200">

                    {/* Prev arrow — overlaid bottom-left of photo area */}
                    {total > 1 && (
                        <button
                            onClick={prev}
                            className="absolute bottom-6 left-5 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
                        >
                            <ChevronLeft size={16} className="text-gray-600" />
                        </button>
                    )}

                    {/* Photo */}
                    {inst.profile_image_url ? (
                        <img
                            src={inst.profile_image_url}
                            alt={inst.name}
                            className="w-44 h-52 rounded-2xl object-cover shadow-md mb-4"
                        />
                    ) : (
                        <div className="w-44 h-52 rounded-2xl bg-gray-200 flex items-center justify-center shadow-md mb-4">
                            <UserCircle2 size={64} className="text-gray-400" />
                        </div>
                    )}

                    {/* Name + verified */}
                    <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-black text-[#1d4ed8] text-lg leading-tight text-center">{inst.name}</h3>
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    </div>

                    {/* Title */}
                    {inst.title && (
                        <p className="text-gray-600 text-xs text-center leading-snug mb-2">{inst.title}</p>
                    )}

                    {/* Star rating */}
                    {inst.rating > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <Star size={15} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-black text-[#1a202c] text-sm">{inst.rating.toFixed(1)}</span>
                            {inst.review_count > 0 && (
                                <span className="text-gray-500 text-xs">({formatReviews(inst.review_count)} Reviews)</span>
                            )}
                        </div>
                    )}

                    {/* Slide indicator */}
                    {total > 1 && (
                        <div className="flex items-center gap-1.5 mt-4">
                            {instructors.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-[#a60303] w-4" : "bg-gray-300"}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Experience + Qualifications */}
                <div className="relative flex-1 p-6 md:p-8">

                    {/* Next arrow */}
                    {total > 1 && (
                        <button
                            onClick={next}
                            className="absolute top-1/2 right-4 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
                        >
                            <ChevronRight size={16} className="text-gray-600" />
                        </button>
                    )}

                    {/* Experience */}
                    {inst.description && (
                        <div className="mb-6 pr-8">
                            <h4 className="text-[#1d4ed8] font-black text-lg mb-3">Experience</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{inst.description}</p>
                        </div>
                    )}

                    {/* Qualifications */}
                    {inst.qualifications && inst.qualifications.length > 0 && (
                        <div>
                            <h4 className="text-[#1d4ed8] font-black text-lg mb-3">Qualifications</h4>
                            <div className="flex flex-wrap gap-2">
                                {inst.qualifications.map(q => (
                                    <span
                                        key={q}
                                        className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700"
                                    >
                                        {q}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── VideoSlider ──────────────────────────────────────────────────

function VideoSlider({ videos }: { videos: { title: string; url: string }[] }) {
    const [current, setCurrent] = useState(0);

    const getYouTubeId = (url: string) => {
        const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
    };

    const prev = () => setCurrent(i => (i - 1 + videos.length) % videos.length);
    const next = () => setCurrent(i => (i + 1) % videos.length);

    const video = videos[current];
    const videoId = getYouTubeId(video.url);
    const total = videos.length;

    return (
        <div className="flex flex-col gap-4">
            {/* Main embed */}
            <div className="relative bg-black rounded-2xl overflow-hidden" style={{ paddingTop: "56.25%" }}>
                {videoId ? (
                    <iframe
                        key={videoId}
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">Invalid YouTube URL</div>
                )}
            </div>

            {/* Title + nav row */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {video.title && (
                        <p className="font-bold text-[#1a202c] text-sm truncate">{video.title}</p>
                    )}
                    {total > 1 && (
                        <p className="text-xs text-gray-400 mt-0.5">{current + 1} of {total} videos</p>
                    )}
                </div>
                {total > 1 && (
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={prev}
                            className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft size={16} className="text-gray-600" />
                        </button>
                        <button
                            onClick={next}
                            className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                            <ChevronRight size={16} className="text-gray-600" />
                        </button>
                    </div>
                )}
            </div>

            {/* Thumbnail strip (when multiple videos) */}
            {total > 1 && (
                <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
                    {videos.map((v, i) => {
                        const tid = getYouTubeId(v.url);
                        return (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === current ? "border-[#a60303] shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                            >
                                {tid ? (
                                    <img
                                        src={`https://img.youtube.com/vi/${tid}/mqdefault.jpg`}
                                        alt={v.title}
                                        className="w-32 h-[72px] object-cover"
                                    />
                                ) : (
                                    <div className="w-32 h-[72px] bg-gray-200 flex items-center justify-center">
                                        <Youtube size={20} className="text-gray-400" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

