"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
    LayoutDashboard,
    FileText,
    GraduationCap,
    Star,
    BookOpen,
    Calendar,
    Mail,
    Briefcase,
    ChevronRight,
    LogOut,
    Settings,
    MailCheck,
    UserCheck,
    Users,
    PanelTop,
    PanelBottom,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/admin/actions";

const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Web Pages", href: "/admin/pages", icon: FileText },
    { name: "Courses", href: "/admin/courses", icon: GraduationCap },
    { name: "Instructors", href: "/admin/instructors", icon: UserCheck },
    { name: "Success Stories", href: "/admin/success-stories", icon: Star },
    { name: "Blog", href: "/admin/blog", icon: BookOpen },
    { name: "Workshops", href: "/admin/workshops", icon: Calendar },
    { name: "Inquiries", href: "/admin/inquiries", icon: Mail },
    { name: "Career", href: "/admin/career", icon: Briefcase },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Headers", href: "/admin/headers", icon: PanelTop },
    { name: "Footers", href: "/admin/footers", icon: PanelBottom },
    { name: "Mail Settings", href: "/admin/mail", icon: MailCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [logoUrl, setLogoUrl] = useState<string>("/logo.png");

    useEffect(() => {
        fetch("/api/pages-content?page=global_settings")
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                const logo = data?.content?.logo_header;
                if (logo) setLogoUrl(logo);
            })
            .catch(() => {/* keep default */});
    }, []);

    return (
        <aside className="w-64 h-screen bg-[#1E1E2F] text-white fixed left-0 top-0 hidden lg:flex flex-col border-r border-white/10">
            {/* Logo */}
            <div className="flex items-center justify-center px-6 py-5 border-b border-white/10">
                <Link href="/admin/dashboard" className="flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-10 w-auto object-contain brightness-0 invert"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.classList.remove("hidden");
                        }}
                    />
                    <span className="hidden text-xl font-black tracking-tight">
                        <span className="text-white">Admin</span>
                        <span style={{ color: "var(--primary)" }}> Panel</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto py-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-xl transition-all group",
                                isActive
                                    ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} />
                                <span className="text-sm font-semibold">{item.name}</span>
                            </div>
                            {isActive && <ChevronRight size={16} />}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className="p-4 border-t border-white/10">
                <form action={signOut}>
                    <button
                        type="submit"
                        className="flex items-center gap-3 w-full p-3 rounded-xl text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all font-semibold text-sm"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </form>
            </div>
        </aside>
    );
}
