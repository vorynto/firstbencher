"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("sending");
        setError("");
        const supabase = createClient();
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetErr) {
            setError(resetErr.message);
            setStatus("error");
            return;
        }
        setStatus("sent");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] px-4 py-16">
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-gray-100 p-10">
                <Link href="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary font-semibold text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <Mail size={24} />
                </div>

                {status === "sent" ? (
                    <>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Check Your Email</h1>
                        <p className="text-gray-500 font-medium">
                            If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your password.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Forgot Password?</h1>
                        <p className="text-gray-500 font-medium mb-8">Enter your email and we&apos;ll send you a link to reset it.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status === "error" && (
                                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm font-semibold">
                                    <AlertCircle size={18} className="shrink-0" /> {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full pl-14 pr-4 py-4 rounded-2xl border border-gray-900 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium text-gray-700 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={status === "sending"}
                                className="w-full bg-primary text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all disabled:opacity-70"
                            >
                                {status === "sending" ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={20} />}
                                {status === "sending" ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
