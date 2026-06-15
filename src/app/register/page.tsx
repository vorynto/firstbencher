"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useSiteLogo } from "@/hooks/useSiteLogo";

function RegisterForm() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const logoUrl = useSiteLogo();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: fullName, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Something went wrong. Please try again.");
                setLoading(false);
                return;
            }
            // Redirect to OTP verification page, pass email via query param
            router.push(`/verify-email?email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName)}&pwd=${encodeURIComponent(password)}`);
        } catch {
            setError("Network error. Please check your connection and try again.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full lg:w-1/2 p-10 md:p-20 flex flex-col justify-center">
            <div className="mb-8 lg:hidden">
                <Image src={logoUrl} alt="Site Logo" width={160} height={52} className="object-contain h-12 w-auto mb-6" />
            </div>

            <header className="mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg mb-4">
                    <User size={14} />
                    CREATE ACCOUNT
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Join First Bencher</h1>
                <p className="text-gray-500 font-medium">Create your account to access exclusive content.</p>
            </header>

            {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 mb-6 text-sm font-semibold">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                    <div className="relative group">
                        <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            required
                            placeholder="John Doe"
                            className="w-full pl-14 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium text-gray-700 transition-all"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                    <div className="relative group">
                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                            className="w-full pl-14 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium text-gray-700 transition-all"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                    <div className="relative group">
                        <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type={showPass ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Min. 8 characters"
                            className="w-full pl-14 pr-14 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium text-gray-700 transition-all"
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
                    <p className="text-xs text-gray-400 ml-1">Must be at least 8 characters long.</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed group/btn mt-2"
                >
                    {loading ? (
                        <Loader2 size={24} className="animate-spin" />
                    ) : (
                        <>
                            <span>CREATE ACCOUNT</span>
                            <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <footer className="mt-8 text-center">
                <p className="text-sm text-gray-500 font-medium">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                        Sign in
                    </Link>
                </p>
            </footer>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] px-4 py-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-bl-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-secondary/5 rounded-tr-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="w-full max-w-[1100px] flex bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 min-h-[650px]">
                {/* Left panel */}
                <div className="hidden lg:flex w-1/2 bg-[#1E1E2F] p-16 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                    <div className="relative z-10">
                        <Link href="/" className="inline-block transition-transform hover:scale-105">
                            <Image src={logoUrl} alt="Site Logo" width={180} height={60} className="object-contain h-14 w-auto brightness-0 invert" />
                        </Link>
                    </div>

                    <div className="relative z-10 max-w-sm space-y-6">
                        <h2 className="text-4xl font-black text-white leading-tight">
                            Unlock Your <br />
                            <span className="text-primary">Full Potential.</span>
                        </h2>
                        <div className="space-y-3">
                            {[
                                "Access exclusive success stories",
                                "Share your own journey",
                                "Connect with 10,000+ professionals",
                            ].map(item => (
                                <div key={item} className="flex items-center gap-3">
                                    <CheckCircle2 size={18} className="text-primary shrink-0" />
                                    <span className="text-white/70 text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <Image key={i} src={`https://i.pravatar.cc/100?u=student${i}`} alt="Student" width={40} height={40} className="rounded-full border-2 border-[#1E1E2F]" />
                            ))}
                        </div>
                        <p className="text-white/40 text-sm font-medium">Join 10,000+ professionals</p>
                    </div>
                </div>

                <Suspense fallback={
                    <div className="w-full lg:w-1/2 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                }>
                    <RegisterForm />
                </Suspense>
            </div>
        </div>
    );
}
