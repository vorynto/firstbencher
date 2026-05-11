"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, CheckCircle2, MailOpen, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase";

function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const fullName = searchParams.get("name") || "";
    const password = searchParams.get("pwd") || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            router.push("/register");
        }
    }, [email, router]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleOtpChange = (index: number, value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(-1);
        const newOtp = [...otp];
        newOtp[index] = cleaned;
        setOtp(newOtp);
        if (cleaned && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otp];
        pasted.split("").forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        const nextEmpty = newOtp.findIndex(v => !v);
        inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    };

    const handleVerify = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            setError("Please enter all 6 digits of your verification code.");
            return;
        }
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpString, password, full_name: fullName }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Verification failed. Please try again.");
                setLoading(false);
                return;
            }

            // Auto sign-in after successful verification
            const supabase = createClient();
            await supabase.auth.signInWithPassword({ email, password });

            setSuccess(true);
            setTimeout(() => {
                router.push("/success-stories");
                router.refresh();
            }, 2000);
        } catch {
            setError("Network error. Please check your connection and try again.");
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setResending(true);
        setError(null);
        try {
            const res = await fetch("/api/auth/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Could not resend code. Please try again.");
            } else {
                setResendCooldown(60);
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch {
            setError("Network error. Please try again.");
        }
        setResending(false);
    };

    if (success) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">Email Verified!</h2>
                <p className="text-gray-500 mb-2">Your account is now active. Welcome to First Bencher!</p>
                <p className="text-sm text-gray-400">Redirecting you now...</p>
                <Loader2 size={20} className="animate-spin text-primary mt-4" />
            </div>
        );
    }

    return (
        <div className="w-full lg:w-1/2 p-10 md:p-16 flex flex-col justify-center">
            <div className="mb-8 lg:hidden">
                <Image src="/logo.png" alt="First Bencher" width={160} height={52} className="object-contain h-12 w-auto mb-6" />
            </div>

            <header className="mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg mb-4">
                    <MailOpen size={14} />
                    EMAIL VERIFICATION
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-3">Check Your Email</h1>
                <p className="text-gray-500 font-medium leading-relaxed">
                    We sent a 6-digit code to{" "}
                    <span className="text-gray-800 font-bold">{email}</span>.
                    Enter it below to verify your account.
                </p>
            </header>

            {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 mb-6 text-sm font-semibold">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    {error}
                </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
                {/* OTP boxes */}
                <div>
                    <label className="text-sm font-bold text-gray-700 ml-1 mb-3 block">Verification Code</label>
                    <div className="flex gap-3 justify-between" onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleOtpChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className="w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 border-gray-100 bg-gray-50 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all text-gray-900"
                            />
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || otp.join("").length !== 6}
                    className="w-full bg-primary text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-xl"
                >
                    {loading ? (
                        <Loader2 size={24} className="animate-spin" />
                    ) : (
                        "VERIFY & CREATE ACCOUNT"
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-3">Didn&apos;t receive the code?</p>
                <button
                    onClick={handleResend}
                    disabled={resending || resendCooldown > 0}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-all"
                >
                    {resending ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <RefreshCw size={14} />
                    )}
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <Link href="/register" className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium">
                    ← Back to Sign Up
                </Link>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] px-4 py-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-bl-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-secondary/5 rounded-tr-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="w-full max-w-[1100px] flex bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 min-h-[600px]">
                {/* Left panel */}
                <div className="hidden lg:flex w-1/2 bg-[#1E1E2F] p-16 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                    <div className="relative z-10">
                        <Link href="/" className="inline-block transition-transform hover:scale-105">
                            <Image src="/logo.png" alt="First Bencher" width={180} height={60} className="object-contain h-14 w-auto brightness-0 invert" />
                        </Link>
                    </div>

                    <div className="relative z-10 max-w-sm">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-8">
                            <MailOpen size={36} className="text-primary" />
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight mb-6">
                            One Last <br />
                            <span className="text-primary">Step.</span>
                        </h2>
                        <p className="text-white/60 text-lg leading-relaxed">
                            We sent a verification code to your email to ensure you have access to this account.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <p className="text-white/30 text-sm">The code expires in 10 minutes.</p>
                    </div>
                </div>

                <Suspense fallback={
                    <div className="w-full lg:w-1/2 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                }>
                    <VerifyEmailForm />
                </Suspense>
            </div>
        </div>
    );
}
