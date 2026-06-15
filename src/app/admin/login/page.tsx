"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { useSiteLogo } from "@/hooks/useSiteLogo";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const router = useRouter();
    const logoUrl = useSiteLogo();

    // Track mouse for subtle parallax effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

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

        router.push("/admin/dashboard");
        router.refresh();
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-[#FAFBFF]">
            {/* ── Dynamic Background ── */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Large Background Blobs */}
                <div
                    className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[var(--primary)]/10 rounded-full blur-[120px] transition-transform duration-700 ease-out"
                    style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)` }}
                />
                <div
                    className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[#F07C5A]/10 rounded-full blur-[100px] transition-transform duration-700 ease-out"
                    style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(250,251,255,1)_100%)]" />
            </div>

            {/* ── Login Card ── */}
            <div className="relative z-10 w-full max-w-lg">
                <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-white/50 p-10 md:p-14 overflow-hidden group">

                    {/* Interior Decorative Element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-[100px] pointer-events-none" />

                    {/* Header */}
                    <div className="flex flex-col items-center mb-10">
                        {/* Logo Wrapper */}
                        <div className="relative mb-8 transform transition-transform hover:scale-105 duration-500">
                            <div className="absolute -inset-4 bg-primary/5 rounded-full blur-xl scale-0 group-hover:scale-100 transition-transform duration-700" />
                            <Image
                                src={logoUrl}
                                alt="Site Logo"
                                width={180}
                                height={60}
                                className="object-contain w-auto h-16 relative z-10"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                    const next = (e.target as HTMLImageElement).nextElementSibling;
                                    if (next) next.classList.remove("hidden");
                                }}
                            />
                            <span className="hidden text-3xl font-black tracking-tight relative z-10">
                                <span className="text-primary">ITech</span>
                                <span className="text-secondary"> Gurus</span>
                            </span>
                        </div>

                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E1E2F] text-white text-[10px] font-black uppercase tracking-[0.1em] mb-4 shadow-lg shadow-black/10">
                            <ShieldCheck size={12} className="text-primary" />
                            Secure Admin Gateway
                        </div>

                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-gray-400 text-sm font-medium">Control center authentication required</p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="flex items-center gap-3 bg-primary-tint text-red-600 rounded-2xl px-5 py-4 mb-8 text-sm font-semibold border border-[var(--primary)]/20 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                Administrator Identitiy
                            </label>
                            <div className="group/field relative">
                                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/field:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Enter verified email"
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium text-gray-700 transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                Secure Pass-Key
                            </label>
                            <div className="group/field relative">
                                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/field:text-primary transition-colors" />
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full pl-14 pr-14 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium text-gray-700 transition-all placeholder:text-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group/btn relative w-full bg-[#1E1E2F] text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 overflow-hidden shadow-xl shadow-black/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                            {loading ? (
                                <Loader2 size={24} className="animate-spin relative z-10" />
                            ) : (
                                <>
                                    <span className="relative z-10 text-sm tracking-wide">AUTHENTICATE SESSION</span>
                                    <ArrowRight size={18} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <span className="w-8 h-[1px] bg-gray-100" />
                            Confidential Access
                            <span className="w-8 h-[1px] bg-gray-100" />
                        </p>
                    </div>
                </div>

                {/* Sub-card decorative elements */}
                <div className="mt-8 flex justify-center gap-6 text-[10px] font-black tracking-widest text-[#1E1E2F]/40 uppercase">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> End-to-end Encrypted</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-secondary" /> ISO Certified portal</span>
                </div>
            </div>

            {/* Floating Glass Circles for depth */}
            <div className="absolute top-[20%] right-[15%] w-24 h-24 border border-primary/20 rounded-full backdrop-blur-sm shadow-xl z-0 animate-pulse pointer-events-none" />
            <div className="absolute bottom-[20%] left-[10%] w-40 h-40 border border-secondary/10 rounded-full backdrop-blur-lg shadow-2xl z-0 animate-bounce pointer-events-none" style={{ animationDuration: '8s' }} />
        </div>
    );
}
