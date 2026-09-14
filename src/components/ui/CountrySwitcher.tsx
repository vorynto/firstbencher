"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useCountry } from "@/components/CountryProvider";
import { cn } from "@/lib/utils";

// Country/currency dropdown used in both the header top bar and the footer.
// Renders nothing until countries are configured in Settings → Payments and
// a selection has been resolved (saved choice, geolocation, or fallback).
export default function CountrySwitcher({ className, theme = "dark" }: { className?: string; theme?: "dark" | "light" }) {
    const { countries, selectedCountry, setSelectedCountryCode, loading } = useCountry();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (loading || countries.length === 0 || !selectedCountry) return null;

    return (
        <div className={cn("relative shrink-0", className)} ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(p => !p)}
                className={cn(
                    "flex items-center gap-1.5 text-[13px] font-semibold transition-colors",
                    theme === "dark" ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-[var(--primary)]"
                )}
            >
                <Globe size={14} className={cn("shrink-0", theme === "dark" ? "text-white/60" : "text-gray-400")} />
                {selectedCountry.currency_code}
                <ChevronDown size={12} className={cn("transition-transform opacity-70", open ? "rotate-180" : "")} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 w-56 max-h-72 overflow-y-auto z-50 text-left">
                    {countries.map(c => (
                        <button
                            key={c.code}
                            type="button"
                            onClick={() => { setSelectedCountryCode(c.code); setOpen(false); }}
                            className={cn(
                                "w-full text-left px-4 py-2 text-sm hover:bg-[#f4f6ff] transition-colors font-medium flex items-center justify-between gap-2",
                                selectedCountry.code === c.code ? "text-[var(--primary)]" : "text-gray-700"
                            )}
                        >
                            <span>{c.name}</span>
                            <span className="text-xs text-gray-400">{c.currency_code}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
