"use client";

import React, { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSiteLogo } from "@/hooks/useSiteLogo";

function LoginForm({ logoUrl }: { logoUrl: string }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";
    const errorParam = searchParams.get("error");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
            setError("Invalid email or password. Please try again.");
            setLoading(false);
            return;
        }

        // Check if account is active
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from("user_profiles")
                .select("is_active")
                .eq("id", user.id)
                .single();

            if (profile && !profile.is_active) {
                await supabase.auth.signOut();
                setError("Your account has been disabled. Please contact support.");
                setLoading(false);
                return;
            }
        }

        router.push(redirect);
        router.refresh();
    };

    return (
        <div className="w-full lg:w-1/2 p-10 md:p-20 flex flex-col justify-center">
            <div className="mb-10 lg:hidden">
                <Image
                    src={logoUrl}
                    alt="Site Logo"
                    width={160}
                    height={52}
                    className="object-contain h-12 w-auto mb-8"
                />
            </div>

            <header className="mb-10">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg mb-4">
                    <User size={14} />
                    STUDENT PORTAL
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-500 font-medium">Please enter your details to sign in.</p>
            </header>

            {(error || errorParam === "disabled") && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 mb-8 text-sm font-semibold">
                    <AlertCircle size={18} className="shrink-0" />
                    {error || "Your account has been disabled. Please contact support."}
                </div>
            )}

            {!error && errorParam !== "disabled" && redirect !== "/" && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl px-5 py-4 mb-8 text-sm font-semibold">
                    <AlertCircle size={18} className="shrink-0" />
                    Please sign in to access that page.
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                    <div className="relative group">
                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                            className="w-full pl-14 pr-4 py-4 rounded-2xl border border-gray-900 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium text-gray-700 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-bold text-gray-700">Password</label>
                        <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative group">
                        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type={showPass ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••••••"
                            className="w-full pl-14 pr-14 py-4 rounded-2xl border border-gray-900 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium text-gray-700 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            tabIndex={-1}
                        >
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-1">
                    <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer" />
                    <label htmlFor="remember" className="text-xs font-bold text-gray-500 cursor-pointer">Remember for 30 days</label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                >
                    {loading ? (
                        <Loader2 size={24} className="animate-spin" />
                    ) : (
                        <>
                            <span>SIGN IN</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <footer className="mt-12 text-center">
                <p className="text-sm text-gray-500 font-medium">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-primary font-semibold hover:underline">
                        Register here
                    </Link>
                </p>
            </footer>
        </div>
    );
}

export default function StudentLoginPage() {
    const logoUrl = useSiteLogo();
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] px-4 py-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-bl-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-secondary/5 rounded-tr-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="w-full max-w-[1100px] flex bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 min-h-[650px]">
                <div className="hidden lg:flex w-1/2 bg-[#1E1E2F] p-16 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                    <div className="relative z-10 max-w-sm">
                        <h2 className="text-4xl font-black text-white leading-tight mb-6">
                            Start Your Journey <br />
                            <span className="text-primary">to Success.</span>
                        </h2>
                        <p className="text-white/60 text-lg">
                            Access your courses, track your progress, and join our global community of learners.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <Image
                                    key={i}
                                    src={`https://i.pravatar.cc/100?u=student${i}`}
                                    alt="Student"
                                    width={40}
                                    height={40}
                                    className="rounded-full border-2 border-[#1E1E2F]"
                                />
                            ))}
                        </div>
                        <p className="text-white/40 text-sm font-medium">Join 10,000+ professionals</p>
                    </div>
                </div>

                <Suspense fallback={<div className="w-full lg:w-1/2 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
                    <LoginForm logoUrl={logoUrl} />
                </Suspense>
            </div>
        </div>
    );
}
