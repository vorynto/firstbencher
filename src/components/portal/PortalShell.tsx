"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    LayoutDashboard,
    BookOpen,
    CreditCard,
    Star,
    Settings,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutPortal } from "@/app/portal/actions";
import { useSiteLogo } from "@/hooks/useSiteLogo";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
    { name: "My Courses", href: "/portal/courses", icon: BookOpen },
    { name: "Payments", href: "/portal/payments", icon: CreditCard },
    { name: "Success Stories", href: "/portal/success-stories", icon: Star },
    { name: "Settings", href: "/portal/settings", icon: Settings },
];

type Props = {
    fullName: string;
    email: string;
    children: React.ReactNode;
};

function initialsOf(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase())
        .join("") || "S";
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
    const isActive = (href: string) => (href === "/portal" ? pathname === href : pathname.startsWith(href));
    return (
        <nav className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-auto py-4">
            {NAV_ITEMS.map(item => {
                const active = isActive(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold",
                            active
                                ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        )}
                    >
                        <item.icon size={19} />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}

function ProfileBlock({ fullName, email }: { fullName: string; email: string }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-black flex items-center justify-center shrink-0">
                {initialsOf(fullName)}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{fullName}</p>
                <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
        </div>
    );
}

export default function PortalShell({ fullName, email, children }: Props) {
    const pathname = usePathname();
    const logoUrl = useSiteLogo();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8F9FF]">
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:flex w-72 h-screen fixed left-0 top-0 bg-white border-r border-gray-100 flex-col">
                <div className="px-6 py-6 border-b border-gray-100">
                    <Image src={logoUrl} alt="Logo" width={150} height={48} className="h-10 w-auto object-contain" />
                </div>
                <div className="px-2 pt-4">
                    <ProfileBlock fullName={fullName} email={email} />
                </div>
                <NavLinks pathname={pathname} />
                <div className="p-4 border-t border-gray-100">
                    <form action={signOutPortal}>
                        <button
                            type="submit"
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-[var(--primary)] transition-all font-bold text-sm"
                        >
                            <LogOut size={19} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* ── Mobile Topbar ── */}
            <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4">
                <Image src={logoUrl} alt="Logo" width={110} height={36} className="h-8 w-auto object-contain" />
                <button
                    onClick={() => setMobileOpen(true)}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600"
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>
            </header>

            {/* ── Mobile Slide-over ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/40 z-50"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 280 }}
                            className="lg:hidden fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-white z-50 flex flex-col"
                        >
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                <Image src={logoUrl} alt="Logo" width={130} height={42} className="h-9 w-auto object-contain" />
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                                    aria-label="Close menu"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <ProfileBlock fullName={fullName} email={email} />
                            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                            <div className="p-4 border-t border-gray-100">
                                <form action={signOutPortal}>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-[var(--primary)] transition-all font-bold text-sm"
                                    >
                                        <LogOut size={19} />
                                        Sign Out
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Main Content ── */}
            <main className="lg:pl-72">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
