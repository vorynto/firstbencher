"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Plus, Edit2, Trash2, Briefcase, MapPin, Users, Loader2,
    ToggleLeft, ToggleRight, X, ChevronDown, ChevronUp,
    FileText, Mail, Phone, GraduationCap, Star, ExternalLink,
    Search, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

type Job = {
    id: string;
    title: string;
    location: string;
    type: string;
    department: string;
    salary_range: string;
    salary_icon: string;
    description: string;
    requirements: string;
    active: boolean;
    created_at: string;
};

type Application = {
    id: string;
    job_id: string;
    candidate_name: string;
    email: string;
    phone: string;
    address: string;
    linkedin_url: string;
    degree: string;
    field_of_study: string;
    institution: string;
    graduation_year: string;
    education_list: string | null;
    work_experience_years: string;
    current_company: string;
    current_role: string;
    experience_list: string | null;
    cover_letter: string;
    skills: string[];
    portfolio_url: string;
    why_join: string;
    resume_url: string;
    status: string;
    created_at: string;
    jobs?: { title: string };
};

const defaultJob = {
    title: "", location: "", type: "Full-time", department: "",
    salary_range: "", salary_icon: "₹", description: "", requirements: "", active: true,
};

const SALARY_ICONS = [
    { value: "₹", label: "₹ — Indian Rupee" },
    { value: "$", label: "$ — US Dollar" },
    { value: "€", label: "€ — Euro" },
    { value: "£", label: "£ — British Pound" },
    { value: "¥", label: "¥ — Yen / Yuan" },
    { value: "AED", label: "AED — UAE Dirham" },
    { value: "SGD", label: "SGD — Singapore Dollar" },
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship"];

const STATUS_STYLES: Record<string, string> = {
    applied: "bg-blue-100 text-blue-700",
    reviewing: "bg-yellow-100 text-yellow-700",
    shortlisted: "bg-purple-100 text-purple-700",
    interviewing: "bg-orange-100 text-orange-700",
    hired: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
};

const STATUSES = ["applied", "reviewing", "shortlisted", "interviewing", "hired", "rejected"];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CareerAdminPage() {
    const supabase = useMemo(() => createClient(), []);
    const [tab, setTab] = useState<"jobs" | "candidates">("jobs");

    // Jobs state
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [jobFormOpen, setJobFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [jobForm, setJobForm] = useState(defaultJob);
    const [savingJob, setSavingJob] = useState(false);

    // Applications state
    const [applications, setApplications] = useState<Application[]>([]);
    const [loadingApps, setLoadingApps] = useState(true);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [appSearch, setAppSearch] = useState("");
    const [appJobFilter, setAppJobFilter] = useState("all");
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        setLoadingJobs(true);
        const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
        if (data) setJobs(data as Job[]);
        setLoadingJobs(false);
    }, [supabase]);

    const fetchApplications = useCallback(async () => {
        setLoadingApps(true);
        const { data } = await supabase
            .from("applications")
            .select("*, jobs(title)")
            .order("created_at", { ascending: false });
        if (data) setApplications(data as Application[]);
        setLoadingApps(false);
    }, [supabase]);

    useEffect(() => { fetchJobs(); fetchApplications(); }, [fetchJobs, fetchApplications]);

    // ── Job CRUD ────────────────────────────────────────────────

    const openNewJob = () => {
        setJobForm(defaultJob);
        setEditingJob(null);
        setJobFormOpen(true);
    };

    const openEditJob = (job: Job) => {
        setJobForm({
            title: job.title || "",
            location: job.location || "",
            type: job.type || "Full-time",
            department: job.department || "",
            salary_range: job.salary_range || "",
            salary_icon: job.salary_icon || "₹",
            description: job.description || "",
            requirements: job.requirements || "",
            active: job.active !== false,
        });
        setEditingJob(job);
        setJobFormOpen(true);
    };

    const handleSaveJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingJob(true);
        let err;
        if (editingJob) {
            ({ error: err } = await supabase.from("jobs").update({ ...jobForm, updated_at: new Date().toISOString() }).eq("id", editingJob.id));
        } else {
            ({ error: err } = await supabase.from("jobs").insert([jobForm]));
        }
        setSavingJob(false);
        if (err) { alert("Save failed: " + err.message); return; }
        setJobFormOpen(false);
        setEditingJob(null);
        fetchJobs();
    };

    const toggleJobActive = async (job: Job) => {
        await supabase.from("jobs").update({ active: !job.active }).eq("id", job.id);
        fetchJobs();
    };

    const deleteJob = async (id: string) => {
        if (!confirm("Delete this job? All applications will also be removed.")) return;
        await supabase.from("jobs").delete().eq("id", id);
        fetchJobs();
        fetchApplications();
    };

    // ── Application status update ────────────────────────────────

    const updateAppStatus = async (id: string, status: string) => {
        setUpdatingStatus(id);
        await supabase.from("applications").update({ status }).eq("id", id);
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        if (selectedApp?.id === id) setSelectedApp(prev => prev ? { ...prev, status } : prev);
        setUpdatingStatus(null);
    };

    // ── Filtered applications ────────────────────────────────────

    const filteredApps = applications.filter(a => {
        const matchSearch = !appSearch ||
            a.candidate_name.toLowerCase().includes(appSearch.toLowerCase()) ||
            a.email.toLowerCase().includes(appSearch.toLowerCase());
        const matchJob = appJobFilter === "all" || a.job_id === appJobFilter;
        return matchSearch && matchJob;
    });

    // ─── Job Form ──────────────────────────────────────────────────────────────

    if (jobFormOpen) {
        return (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black">{editingJob ? "Edit Job" : "Post a New Job"}</h2>
                    <button onClick={() => setJobFormOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveJob} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Job Title *</label>
                            <input required className="border p-3 rounded-xl text-sm" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Senior PMP Instructor" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department</label>
                            <input className="border p-3 rounded-xl text-sm" value={jobForm.department} onChange={e => setJobForm({ ...jobForm, department: e.target.value })} placeholder="e.g. Education" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                            <input className="border p-3 rounded-xl text-sm" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="e.g. Remote / New York" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Job Type</label>
                            <select className="border p-3 rounded-xl text-sm bg-white" value={jobForm.type} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}>
                                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Currency Icon</label>
                            <select className="border p-3 rounded-xl text-sm bg-white" value={jobForm.salary_icon} onChange={e => setJobForm({ ...jobForm, salary_icon: e.target.value })}>
                                {SALARY_ICONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Salary Range</label>
                            <div className="flex items-center border rounded-xl overflow-hidden focus-within:border-[var(--primary)] transition-colors">
                                <span className="px-3 py-3 bg-gray-50 text-[var(--primary)] font-black text-base border-r border-gray-200 shrink-0">{jobForm.salary_icon || "₹"}</span>
                                <input className="flex-1 p-3 text-sm outline-none" value={jobForm.salary_range} onChange={e => setJobForm({ ...jobForm, salary_range: e.target.value })} placeholder="e.g. 6–8 LPA or 60k–80k" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Job Description</label>
                        <RichTextEditor value={jobForm.description} onChange={v => setJobForm({ ...jobForm, description: v })} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Requirements</label>
                        <RichTextEditor value={jobForm.requirements} onChange={v => setJobForm({ ...jobForm, requirements: v })} placeholder="List the qualifications, skills, and experience required..." />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={jobForm.active} onChange={e => setJobForm({ ...jobForm, active: e.target.checked })} className="w-5 h-5 accent-[var(--primary)]" />
                        <span className="font-bold text-sm">Published (visible to public)</span>
                    </label>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setJobFormOpen(false)} className="px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={savingJob} className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2">
                            {savingJob ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : editingJob ? "Update Job" : "Post Job"}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // ─── Main View ─────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-8">
            {/* Header + tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-1">Career Portal</h1>
                    <p className="text-muted-foreground text-sm">Manage job openings and review candidate applications.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        {(["jobs", "candidates"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={cn("px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize", tab === t ? "bg-white text-[var(--primary)] shadow-sm" : "text-gray-500 hover:text-gray-700")}
                            >
                                {t === "candidates" ? `Candidates (${applications.length})` : "Job Openings"}
                            </button>
                        ))}
                    </div>
                    {tab === "jobs" && (
                        <button onClick={openNewJob} className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[var(--primary-dark)] transition-colors">
                            <Plus size={18} /> Post Job
                        </button>
                    )}
                </div>
            </div>

            {/* ── Jobs Tab ── */}
            {tab === "jobs" && (
                loadingJobs ? (
                    <div className="flex h-48 items-center justify-center"><Loader2 className="animate-spin text-[var(--primary)]" /></div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="font-bold text-gray-500">No jobs posted yet.</p>
                        <button onClick={openNewJob} className="mt-4 text-sm text-[var(--primary)] font-bold hover:underline">Post your first job →</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {jobs.map(job => {
                            const appCount = applications.filter(a => a.job_id === job.id).length;
                            return (
                                <div key={job.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col gap-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h3 className="font-black text-gray-900 text-lg leading-tight">{job.title}</h3>
                                            {job.department && <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mt-0.5">{job.department}</p>}
                                        </div>
                                        <button
                                            onClick={() => toggleJobActive(job)}
                                            title={job.active ? "Disable" : "Enable"}
                                            className={cn("shrink-0 transition-colors", job.active ? "text-green-500 hover:text-green-700" : "text-gray-300 hover:text-gray-500")}
                                        >
                                            {job.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
                                        {job.location && <span className="flex items-center gap-1"><MapPin size={12} className="text-[var(--primary)]" />{job.location}</span>}
                                        {job.type && <span className="flex items-center gap-1"><Briefcase size={12} className="text-[var(--primary)]" />{job.type}</span>}
                                        {job.salary_range && <span className="flex items-center gap-1"><Star size={12} className="text-[var(--primary)]" />{job.salary_range}</span>}
                                        <span className="flex items-center gap-1"><Users size={12} className="text-[var(--primary)]" />{appCount} applicant{appCount !== 1 ? "s" : ""}</span>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                        <span className={cn("text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full", job.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                                            {job.active ? "Active" : "Inactive"}
                                        </span>
                                        <div className="flex-1" />
                                        <button onClick={() => openEditJob(job)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteJob(job.id)} className="p-2 rounded-lg hover:bg-primary-tint text-red-400 transition-colors"><Trash2 size={16} /></button>
                                        <button onClick={() => { setAppJobFilter(job.id); setTab("candidates"); }} className="p-2 rounded-lg hover:bg-[var(--primary)]/5 text-[var(--primary)] transition-colors"><Eye size={16} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* ── Candidates Tab ── */}
            {tab === "candidates" && (
                <div className="flex flex-col gap-5">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input value={appSearch} onChange={e => setAppSearch(e.target.value)} placeholder="Search candidates…" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--primary)] transition-all" />
                        </div>
                        <select value={appJobFilter} onChange={e => setAppJobFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
                            <option value="all">All Jobs</option>
                            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                        </select>
                        {appJobFilter !== "all" && (
                            <button onClick={() => setAppJobFilter("all")} className="text-xs text-gray-400 hover:text-gray-600 font-bold flex items-center gap-1"><X size={13} /> Clear filter</button>
                        )}
                    </div>

                    {loadingApps ? (
                        <div className="flex h-48 items-center justify-center"><Loader2 className="animate-spin text-[var(--primary)]" /></div>
                    ) : filteredApps.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <Users size={40} className="text-gray-300 mx-auto mb-3" />
                            <p className="font-bold text-gray-500">No applications yet.</p>
                        </div>
                    ) : (
                        <div className="flex gap-5 flex-col xl:flex-row">
                            {/* List */}
                            <div className="flex-1 flex flex-col gap-2 min-w-0">
                                {filteredApps.map(app => (
                                    <button
                                        key={app.id}
                                        onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                                        className={cn("text-left w-full bg-white border rounded-2xl px-5 py-4 hover:shadow-md transition-all flex items-center gap-4", selectedApp?.id === app.id ? "border-[var(--primary)] shadow-md" : "border-gray-100")}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-base shrink-0">
                                            {app.candidate_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 text-sm leading-tight truncate">{app.candidate_name}</p>
                                            <p className="text-xs text-gray-500 truncate">{app.jobs?.title || "Unknown job"}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full", STATUS_STYLES[app.status] || "bg-gray-100 text-gray-500")}>
                                                {app.status}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Detail panel */}
                            {selectedApp && (
                                <div className="xl:w-105 shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                                    <div className="bg-[#111111] px-6 py-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">Candidate</p>
                                                <h3 className="text-white font-black text-lg">{selectedApp.candidate_name}</h3>
                                                <p className="text-gray-400 text-xs mt-0.5">{selectedApp.jobs?.title}</p>
                                            </div>
                                            <button onClick={() => setSelectedApp(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><X size={18} /></button>
                                        </div>
                                    </div>

                                    <div className="overflow-y-auto flex-1 p-5 space-y-5">
                                        {/* Status update */}
                                        <div>
                                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Update Status</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {STATUSES.map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => updateAppStatus(selectedApp.id, s)}
                                                        disabled={updatingStatus === selectedApp.id}
                                                        className={cn("text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition-all border", selectedApp.status === s ? STATUS_STYLES[s] + " border-transparent" : "bg-white text-gray-400 border-gray-200 hover:border-gray-400")}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Contact */}
                                        <Section title="Contact">
                                            <Row icon={<Mail size={13} />} label="Email" value={selectedApp.email} />
                                            <Row icon={<Phone size={13} />} label="Phone" value={selectedApp.phone} />
                                            {selectedApp.address && <Row icon={<MapPin size={13} />} label="Location" value={selectedApp.address} />}
                                            {selectedApp.linkedin_url && (
                                                <Row icon={<ExternalLink size={13} />} label="LinkedIn" value={
                                                    <a href={selectedApp.linkedin_url} target="_blank" rel="noreferrer" className="text-[var(--primary)] hover:underline text-xs font-semibold">View Profile</a>
                                                } />
                                            )}
                                        </Section>

                                        {/* Education */}
                                        {(selectedApp.degree || selectedApp.institution || selectedApp.education_list) && (
                                            <Section title="Education">
                                                {(() => {
                                                    const list = selectedApp.education_list ? (() => { try { return JSON.parse(selectedApp.education_list); } catch { return null; } })() : null;
                                                    const entries = list?.length ? list : [{ degree: selectedApp.degree, field_of_study: selectedApp.field_of_study, institution: selectedApp.institution, graduation_year: selectedApp.graduation_year }];
                                                    return entries.map((e: { degree?: string; field_of_study?: string; institution?: string; graduation_year?: string }, i: number) => (
                                                        <div key={i} className={entries.length > 1 ? "pl-2 border-l-2 border-[var(--primary)]/20 space-y-1" : "space-y-1"}>
                                                            {entries.length > 1 && <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider mb-1">{i === 0 ? "Primary" : `Qualification ${i + 1}`}</p>}
                                                            {e.degree && <Row icon={<GraduationCap size={13} />} label="Degree" value={e.degree} />}
                                                            {e.field_of_study && <Row label="Field" value={e.field_of_study} />}
                                                            {e.institution && <Row label="Institution" value={e.institution} />}
                                                            {e.graduation_year && <Row label="Year" value={e.graduation_year} />}
                                                        </div>
                                                    ));
                                                })()}
                                            </Section>
                                        )}

                                        {/* Experience */}
                                        {(selectedApp.work_experience_years || selectedApp.current_company || selectedApp.experience_list) && (
                                            <Section title="Experience">
                                                {(() => {
                                                    const list = selectedApp.experience_list ? (() => { try { return JSON.parse(selectedApp.experience_list); } catch { return null; } })() : null;
                                                    const entries = list?.length ? list : [{ years: selectedApp.work_experience_years, company: selectedApp.current_company, role: selectedApp.current_role }];
                                                    return entries.map((e: { years?: string; company?: string; role?: string }, i: number) => (
                                                        <div key={i} className={entries.length > 1 ? "pl-2 border-l-2 border-[var(--primary)]/20 space-y-1" : "space-y-1"}>
                                                            {entries.length > 1 && <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider mb-1">{i === 0 ? "Most Recent" : `Experience ${i + 1}`}</p>}
                                                            {e.years && <Row icon={<Briefcase size={13} />} label="Experience" value={e.years} />}
                                                            {e.company && <Row label="Company" value={e.company} />}
                                                            {e.role && <Row label="Role" value={e.role} />}
                                                        </div>
                                                    ));
                                                })()}
                                            </Section>
                                        )}

                                        {/* Skills */}
                                        {selectedApp.skills?.length > 0 && (
                                            <Section title="Skills">
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {selectedApp.skills.map(s => (
                                                        <span key={s} className="bg-primary-tint text-[var(--primary)] text-xs font-bold px-2.5 py-1 rounded-full border border-[var(--primary)]/20">{s}</span>
                                                    ))}
                                                </div>
                                            </Section>
                                        )}

                                        {/* Cover letter */}
                                        {selectedApp.cover_letter && (
                                            <Section title="Cover Letter">
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{selectedApp.cover_letter}</p>
                                            </Section>
                                        )}

                                        {/* Why join */}
                                        {selectedApp.why_join && (
                                            <Section title="Why First Bencher?">
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{selectedApp.why_join}</p>
                                            </Section>
                                        )}

                                        {/* Links */}
                                        <Section title="Documents & Links">
                                            <a href={selectedApp.resume_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[var(--primary)] font-bold text-sm hover:underline">
                                                <FileText size={15} /> View Resume
                                            </a>
                                            {selectedApp.portfolio_url && (
                                                <a href={selectedApp.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[var(--primary)] font-bold text-sm hover:underline">
                                                    <ExternalLink size={15} /> Portfolio / GitHub
                                                </a>
                                            )}
                                        </Section>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Helper sub-components ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">{title}</p>
            <div className="space-y-1.5">{children}</div>
        </div>
    );
}

function Row({ icon, label, value }: { icon?: React.ReactNode; label?: string; value: React.ReactNode }) {
    return (
        <div className="flex gap-2 items-start">
            {icon && <span className="text-[var(--primary)] mt-0.5 shrink-0">{icon}</span>}
            {label && <span className="text-xs text-gray-400 font-semibold w-20 shrink-0">{label}</span>}
            <span className="text-xs text-gray-700 font-medium">{value}</span>
        </div>
    );
}
