"use client";

import React, { useState } from "react";
import {
    X, ChevronRight, ChevronLeft, CheckCircle2, Loader2,
    Plus, Trash2, User, GraduationCap, Briefcase, Wrench,
    FileText, Upload
} from "lucide-react";
import { createClient } from "@/lib/supabase";

type Job = { id: string; title: string; location?: string | null; type?: string | null };

type Props = { job: Job; onClose: () => void };

type EducationEntry = {
    degree: string;
    field_of_study: string;
    institution: string;
    graduation_year: string;
};

type ExperienceEntry = {
    years: string;
    company: string;
    role: string;
};

type FormData = {
    candidate_name: string;
    email: string;
    phone: string;
    address: string;
    linkedin_url: string;
    education: EducationEntry[];
    experience: ExperienceEntry[];
    cover_letter: string;
    skills: string[];
    portfolio_url: string;
    why_join: string;
    declaration: boolean;
};

const STEPS = [
    { id: 1, label: "Personal Info", icon: User },
    { id: 2, label: "Education", icon: GraduationCap },
    { id: 3, label: "Experience", icon: Briefcase },
    { id: 4, label: "Skills", icon: Wrench },
    { id: 5, label: "Documents", icon: FileText },
];

const emptyEdu = (): EducationEntry => ({ degree: "", field_of_study: "", institution: "", graduation_year: "" });
const emptyExp = (): ExperienceEntry => ({ years: "", company: "", role: "" });

const empty: FormData = {
    candidate_name: "", email: "", phone: "", address: "", linkedin_url: "",
    education: [emptyEdu()],
    experience: [emptyExp()],
    cover_letter: "",
    skills: [], portfolio_url: "", why_join: "",
    declaration: false,
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all bg-white";

export default function JobApplyModal({ job, onClose }: Props) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormData>(empty);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [skillInput, setSkillInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    // ── Education helpers ───────────────────────────────────────────
    const setEdu = (i: number, key: keyof EducationEntry, val: string) =>
        setForm(f => { const ed = [...f.education]; ed[i] = { ...ed[i], [key]: val }; return { ...f, education: ed }; });
    const addEdu = () => setForm(f => ({ ...f, education: [...f.education, emptyEdu()] }));
    const removeEdu = (i: number) => setForm(f => ({ ...f, education: f.education.filter((_, idx) => idx !== i) }));

    // ── Experience helpers ──────────────────────────────────────────
    const setExp = (i: number, key: keyof ExperienceEntry, val: string) =>
        setForm(f => { const ex = [...f.experience]; ex[i] = { ...ex[i], [key]: val }; return { ...f, experience: ex }; });
    const addExp = () => setForm(f => ({ ...f, experience: [...f.experience, emptyExp()] }));
    const removeExp = (i: number) => setForm(f => ({ ...f, experience: f.experience.filter((_, idx) => idx !== i) }));

    // ── Skills helpers ──────────────────────────────────────────────
    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }));
        setSkillInput("");
    };
    const removeSkill = (s: string) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

    // ── Resume file handler ─────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/pdf") { setError("Only PDF files are allowed."); return; }
        if (file.size > 5 * 1024 * 1024) { setError("File size must be under 5 MB."); return; }
        setError("");
        setResumeFile(file);
    };

    // ── Validation ──────────────────────────────────────────────────
    const validateStep = (): boolean => {
        setError("");
        if (step === 1) {
            if (!form.candidate_name.trim()) { setError("Full name is required."); return false; }
            if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { setError("Valid email is required."); return false; }
            if (!form.phone.trim()) { setError("Phone number is required."); return false; }
        }
        if (step === 2) {
            if (!form.education[0]?.degree.trim()) { setError("Highest qualification is required."); return false; }
            if (!form.education[0]?.institution.trim()) { setError("Institution name is required."); return false; }
        }
        if (step === 5) {
            if (!resumeFile) { setError("Please upload your resume (PDF only)."); return false; }
            if (!form.declaration) { setError("Please accept the declaration."); return false; }
        }
        return true;
    };

    const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, 5)); };
    const prev = () => setStep(s => Math.max(s - 1, 1));

    // ── Submit ──────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validateStep()) return;
        if (!resumeFile) { setError("Please upload your resume."); return; }
        setSubmitting(true);
        setError("");
        const supabase = createClient();

        // Upload PDF to Supabase Storage
        const safeName = resumeFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `${job.id}/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
            .from("resumes")
            .upload(filePath, resumeFile, { contentType: "application/pdf" });

        if (uploadError) {
            setError("Resume upload failed: " + uploadError.message);
            setSubmitting(false);
            return;
        }

        const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(filePath);
        const resume_url = urlData.publicUrl;

        const primaryEdu = form.education[0] || emptyEdu();
        const primaryExp = form.experience[0] || emptyExp();

        const { error: err } = await supabase.from("applications").insert([{
            job_id: job.id,
            candidate_name: form.candidate_name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            linkedin_url: form.linkedin_url,
            degree: primaryEdu.degree,
            field_of_study: primaryEdu.field_of_study,
            institution: primaryEdu.institution,
            graduation_year: primaryEdu.graduation_year,
            education_list: JSON.stringify(form.education),
            work_experience_years: primaryExp.years,
            current_company: primaryExp.company,
            current_role: primaryExp.role,
            experience_list: JSON.stringify(form.experience),
            cover_letter: form.cover_letter,
            skills: form.skills,
            portfolio_url: form.portfolio_url,
            why_join: form.why_join,
            resume_url,
            status: "applied",
        }]);

        setSubmitting(false);
        if (err) { setError("Submission failed: " + err.message); return; }

        fetch("/api/mail/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "job",
                data: {
                    name: form.candidate_name,
                    email: form.email,
                    phone: form.phone,
                    address: form.address,
                    job_title: job.title,
                    education: form.education.map(e => [e.degree, e.institution].filter(Boolean).join(" · ")).filter(Boolean).join(" | "),
                    experience: form.experience.map(e => [e.role, e.company].filter(Boolean).join(" @ ")).filter(Boolean).join(" | "),
                    skills: form.skills.join(", "),
                    resume_url,
                },
            }),
        }).catch(() => {});

        setSubmitted(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop — no onClick so clicking outside does NOT close */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[95dvh] flex flex-col">

                {/* Header */}
                <div className="bg-[#111111] px-6 py-5 flex items-start justify-between shrink-0">
                    <div>
                        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">Apply for</p>
                        <h2 className="text-white font-black text-lg leading-tight">{job.title}</h2>
                        {(job.location || job.type) && (
                            <p className="text-gray-400 text-xs mt-1">{[job.location, job.type].filter(Boolean).join(" · ")}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-4">
                        <X size={20} />
                    </button>
                </div>

                {/* Step bar */}
                {!submitted && (
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-1">
                            {STEPS.map((s, i) => {
                                const Icon = s.icon;
                                const done = step > s.id;
                                const active = step === s.id;
                                return (
                                    <React.Fragment key={s.id}>
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? "bg-[var(--primary)] text-white" : done ? "text-green-600" : "text-gray-400"}`}>
                                            {done ? <CheckCircle2 size={13} /> : <Icon size={13} />}
                                            <span className="hidden sm:inline">{s.label}</span>
                                        </div>
                                        {i < STEPS.length - 1 && <div className={`flex-1 h-px ${done ? "bg-green-300" : "bg-gray-200"}`} />}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-6">
                    {submitted ? (
                        <div className="flex flex-col items-center gap-4 text-center py-8">
                            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                                <CheckCircle2 size={40} className="text-green-500" />
                            </div>
                            <div>
                                <p className="font-black text-xl text-gray-900">Application Submitted!</p>
                                <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                                    Thank you {form.candidate_name.split(" ")[0]}! We&apos;ll review your application and get back to you soon.
                                </p>
                            </div>
                            <button onClick={onClose} className="mt-4 bg-[var(--primary)] text-white px-8 py-3 rounded-xl font-bold hover:bg-[var(--primary-dark)] transition-colors">
                                Close
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">

                            {/* Step 1: Personal Info */}
                            {step === 1 && (
                                <>
                                    <h3 className="font-black text-gray-900 text-base">Personal Information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field label="Full Name" required>
                                            <input className={inputCls} value={form.candidate_name} onChange={e => setForm(f => ({ ...f, candidate_name: e.target.value }))} placeholder="e.g. John Smith" />
                                        </Field>
                                        <Field label="Email Address" required>
                                            <input type="email" className={inputCls} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
                                        </Field>
                                        <Field label="Phone Number" required>
                                            <input type="tel" className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
                                        </Field>
                                        <Field label="City / Location">
                                            <input className={inputCls} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="e.g. Chennai, India" />
                                        </Field>
                                    </div>
                                    <Field label="LinkedIn Profile URL">
                                        <input className={inputCls} value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/your-profile" />
                                    </Field>
                                </>
                            )}

                            {/* Step 2: Education */}
                            {step === 2 && (
                                <>
                                    <h3 className="font-black text-gray-900 text-base">Educational Qualification</h3>
                                    <div className="flex flex-col gap-4">
                                        {form.education.map((edu, i) => (
                                            <div key={i} className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider">
                                                        {i === 0 ? "Primary Qualification" : `Qualification ${i + 1}`}
                                                    </p>
                                                    {form.education.length > 1 && (
                                                        <button type="button" onClick={() => removeEdu(i)} className="p-1.5 rounded-lg text-red-400 hover:bg-accent hover:text-red-600 transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <Field label="Highest Qualification" required={i === 0}>
                                                        <select className={inputCls} value={edu.degree} onChange={e => setEdu(i, "degree", e.target.value)}>
                                                            <option value="">— Select —</option>
                                                            {["High School / Diploma", "Bachelor's Degree", "Master's Degree", "MBA", "PhD / Doctorate", "Professional Certification", "Other"].map(d => (
                                                                <option key={d} value={d}>{d}</option>
                                                            ))}
                                                        </select>
                                                    </Field>
                                                    <Field label="Field of Study">
                                                        <input className={inputCls} value={edu.field_of_study} onChange={e => setEdu(i, "field_of_study", e.target.value)} placeholder="e.g. Computer Science" />
                                                    </Field>
                                                    <Field label="Institution / University" required={i === 0}>
                                                        <input className={inputCls} value={edu.institution} onChange={e => setEdu(i, "institution", e.target.value)} placeholder="e.g. Anna University" />
                                                    </Field>
                                                    <Field label="Year of Graduation">
                                                        <input className={inputCls} value={edu.graduation_year} onChange={e => setEdu(i, "graduation_year", e.target.value)} placeholder="e.g. 2020" maxLength={4} />
                                                    </Field>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={addEdu} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--primary)] text-[var(--primary)] text-sm font-bold hover:bg-accent transition-colors self-start">
                                        <Plus size={15} /> Add Another Qualification
                                    </button>
                                </>
                            )}

                            {/* Step 3: Work Experience */}
                            {step === 3 && (
                                <>
                                    <h3 className="font-black text-gray-900 text-base">Work Experience</h3>
                                    <div className="flex flex-col gap-4">
                                        {form.experience.map((exp, i) => (
                                            <div key={i} className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider">
                                                        {i === 0 ? "Current / Most Recent" : `Experience ${i + 1}`}
                                                    </p>
                                                    {form.experience.length > 1 && (
                                                        <button type="button" onClick={() => removeExp(i)} className="p-1.5 rounded-lg text-red-400 hover:bg-accent hover:text-red-600 transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <Field label="Years of Experience">
                                                        <select className={inputCls} value={exp.years} onChange={e => setExp(i, "years", e.target.value)}>
                                                            <option value="">— Select —</option>
                                                            {["Fresher (0 years)", "Less than 1 year", "1–2 years", "3–5 years", "6–10 years", "10+ years"].map(y => (
                                                                <option key={y} value={y}>{y}</option>
                                                            ))}
                                                        </select>
                                                    </Field>
                                                    <Field label="Company Name">
                                                        <input className={inputCls} value={exp.company} onChange={e => setExp(i, "company", e.target.value)} placeholder="e.g. Infosys" />
                                                    </Field>
                                                    <Field label="Job Title / Role">
                                                        <input className={inputCls} value={exp.role} onChange={e => setExp(i, "role", e.target.value)} placeholder="e.g. Project Manager" />
                                                    </Field>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={addExp} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--primary)] text-[var(--primary)] text-sm font-bold hover:bg-accent transition-colors self-start">
                                        <Plus size={15} /> Add More Experience
                                    </button>
                                    <Field label="Cover Letter / Summary">
                                        <textarea rows={4} className={inputCls + " resize-none"} value={form.cover_letter} onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))} placeholder="Briefly describe your experience and why you're a great fit..." />
                                    </Field>
                                </>
                            )}

                            {/* Step 4: Skills */}
                            {step === 4 && (
                                <>
                                    <h3 className="font-black text-gray-900 text-base">Skills & Additional Info</h3>
                                    <Field label="Key Skills">
                                        <div className="flex gap-2">
                                            <input
                                                className={inputCls}
                                                value={skillInput}
                                                onChange={e => setSkillInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                                                placeholder="Type a skill and press Enter"
                                            />
                                            <button type="button" onClick={addSkill} className="px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl font-bold text-sm hover:bg-[var(--primary-dark)] transition-colors shrink-0">
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        {form.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {form.skills.map(s => (
                                                    <span key={s} className="flex items-center gap-1.5 bg-accent text-[var(--primary)] text-xs font-bold px-3 py-1.5 rounded-full border border-[var(--primary)]/20">
                                                        {s}
                                                        <button onClick={() => removeSkill(s)} className="hover:text-red-700"><Trash2 size={11} /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </Field>
                                    <Field label="Portfolio / GitHub / Website URL">
                                        <input className={inputCls} value={form.portfolio_url} onChange={e => setForm(f => ({ ...f, portfolio_url: e.target.value }))} placeholder="https://yourportfolio.com" />
                                    </Field>
                                    <Field label="Why do you want to join us?">
                                        <textarea rows={3} className={inputCls + " resize-none"} value={form.why_join} onChange={e => setForm(f => ({ ...f, why_join: e.target.value }))} placeholder="Tell us what excites you about this role..." />
                                    </Field>
                                </>
                            )}

                            {/* Step 5: Resume Upload */}
                            {step === 5 && (
                                <>
                                    <h3 className="font-black text-gray-900 text-base">Resume & Submission</h3>

                                    <Field label="Upload Resume (PDF only)" required>
                                        <label className={`flex flex-col items-center justify-center gap-3 border-2 rounded-2xl p-6 cursor-pointer transition-all ${resumeFile ? "border-green-400 bg-green-50" : "border-dashed border-gray-300 bg-gray-50 hover:border-[var(--primary)] hover:bg-accent"} group`}>
                                            <input
                                                type="file"
                                                accept=".pdf,application/pdf"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                            {resumeFile ? (
                                                <>
                                                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                                        <FileText size={24} className="text-green-600" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-gray-900 text-sm">{resumeFile.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{(resumeFile.size / 1024).toFixed(0)} KB · PDF</p>
                                                    </div>
                                                    <span className="text-xs text-green-600 font-bold">Click to replace</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                                        <Upload size={22} className="text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-gray-700 text-sm">Click to upload your resume</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">PDF only · Max 5 MB</p>
                                                    </div>
                                                </>
                                            )}
                                        </label>
                                        {resumeFile && (
                                            <button type="button" onClick={() => setResumeFile(null)} className="text-xs text-red-400 hover:text-red-600 font-semibold self-start mt-1">
                                                Remove file
                                            </button>
                                        )}
                                    </Field>

                                    {/* Review summary */}
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                                        <p className="font-black text-gray-700 text-xs uppercase tracking-wider mb-3">Application Summary</p>
                                        {([
                                            ["Name", form.candidate_name],
                                            ["Email", form.email],
                                            ["Phone", form.phone],
                                            ["Education", form.education.map(e => [e.degree, e.institution].filter(Boolean).join(" · ")).filter(Boolean).join(" | ")],
                                            ["Experience", form.experience.map(e => [e.role, e.company].filter(Boolean).join(" @ ")).filter(Boolean).join(" | ")],
                                            ["Skills", form.skills.join(", ")],
                                            ["Resume", resumeFile?.name || ""],
                                        ] as [string, string][]).map(([label, val]) => val ? (
                                            <div key={label} className="flex gap-3 text-sm">
                                                <span className="text-gray-400 font-semibold w-24 shrink-0">{label}</span>
                                                <span className="text-gray-700 font-medium">{val}</span>
                                            </div>
                                        ) : null)}
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={form.declaration} onChange={e => setForm(f => ({ ...f, declaration: e.target.checked }))} className="w-4 h-4 mt-0.5 accent-[var(--primary)]" />
                                        <span className="text-xs text-gray-600 leading-relaxed">
                                            I confirm that all the information provided is accurate and complete. I consent to First Bencher storing and processing my application data.
                                        </span>
                                    </label>
                                </>
                            )}

                            {error && <p className="text-red-500 text-sm font-medium bg-accent px-4 py-2.5 rounded-xl">{error}</p>}
                        </div>
                    )}
                </div>

                {/* Footer nav */}
                {!submitted && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center shrink-0 bg-white">
                        <button
                            onClick={prev}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                        <span className="text-xs font-bold text-gray-400">Step {step} of {STEPS.length}</span>
                        {step < 5 ? (
                            <button onClick={next} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[var(--primary-dark)] transition-colors">
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[var(--primary-dark)] disabled:opacity-60 transition-colors">
                                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <>Submit Application <CheckCircle2 size={16} /></>}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
