"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [invalid, setInvalid] = useState(false);
    const readyRef = useRef(false);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
    const [error, setError] = useState("");

    useEffect(() => {
        const supabase = createClient();
        // The Supabase client parses the recovery token out of the URL on
        // load and, if valid, fires this event with an active session.
        const markReady = () => {
            readyRef.current = true;
            setReady(true);
        };
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                markReady();
            }
        });
        // If we already have a session by the time this runs (e.g. fast
        // network), don't make the user wait for the event.
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) markReady();
        });
        const timeout = setTimeout(() => {
            if (!readyRef.current) setInvalid(true);
        }, 3000);
        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setStatus("error");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            setStatus("error");
            return;
        }
        setStatus("saving");
        const supabase = createClient();
        const { error: updateErr } = await supabase.auth.updateUser({ password });
        if (updateErr) {
            setError(updateErr.message);
            setStatus("error");
            return;
        }
        router.push("/portal");
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] px-4 py-16">
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-gray-100 p-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <Lock size={24} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">Set a New Password</h1>

                {!ready && !invalid && (
                    <div className="flex items-center gap-3 text-gray-400 py-8">
                        <Loader2 size={20} className="animate-spin" /> Verifying your link...
                    </div>
                )}

                {invalid && !ready && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm font-semibold">
                            <AlertCircle size={18} className="shrink-0" />
                            This link has expired or is invalid. Please request a new one.
                        </div>
                        <Link href="/forgot-password" className="text-primary font-bold text-sm hover:underline">
                            Request a new link
                        </Link>
                    </div>
                )}

                {ready && (
                    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                        {status === "error" && (
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3.5 rounded-xl border border-red-100 font-medium text-sm">
                                <AlertCircle size={16} className="shrink-0" /> {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">New Password</label>
                            <div className="relative">
                                <input
                                    required
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium text-gray-700 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Confirm Password</label>
                            <input
                                required
                                type={showPass ? "text" : "password"}
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium text-gray-700 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === "saving"}
                            className="w-full bg-primary text-white font-black h-14 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-70"
                        >
                            {status === "saving" ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                            {status === "saving" ? "Saving..." : "Set Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
