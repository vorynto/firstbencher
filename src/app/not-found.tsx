"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-xl w-full text-center">
                {/* ── 404 TYPOGRAPHY ───────────────────────────────────────── */}
                <div className="relative mb-8">
                    <h1 className="text-[150px] sm:text-[200px] font-black leading-none select-none bg-gradient-to-b from-primary/20 to-transparent bg-clip-text text-transparent">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-4xl sm:text-6xl font-black text-foreground tracking-tighter">
                            OOPS!
                        </h2>
                    </div>
                </div>

                {/* ── TEXT CONTENT ─────────────────────────────────────────── */}
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">Page Not Found</h3>
                <p className="text-muted-foreground mb-10 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                {/* ── ACTIONS ──────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                    >
                        <Home size={20} />
                        Return to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-foreground font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                </div>

                {/* ── DECORATIVE ELEMENTS ───────────────────────────────────── */}
                <div className="mt-16 flex justify-center gap-4 opacity-20 outline-none select-none pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping delay-75" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping delay-150" />
                </div>
            </div>
        </div>
    );
}
