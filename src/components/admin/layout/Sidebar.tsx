"use client";

import React from "react";
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
    Users
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
    { name: "Mail Settings", href: "/admin/mail", icon: MailCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-[#1E1E2F] text-white fixed left-0 top-0 hidden lg:flex flex-col border-r border-white/10">
            {/* Logo */}
            <div className="flex items-center justify-center px-6 py-5 border-b border-white/10">
                <Link href="/admin/dashboard" className="flex items-center justify-center">
                    <Image
                        src="/logo.png"
                        alt="First Bencher"
                        width={160}
                        height={52}
                        className="h-8 w-auto object-contain brightness-0 invert"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            const fallback = (e.target as HTMLImageElement).nextElementSibling;
                            if (fallback) fallback.classList.remove("hidden");
                        }}
                    />
                    {/* Fallback text if logo.png is missing */}
                    <span className="hidden text-xl font-black tracking-tight">
                        <span className="text-white">ITech</span>
                        <span className="text-primary"> Gurus</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-xl transition-all group",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
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
                        className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-semibold text-sm"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </form>
            </div>
        </aside>
    );
}

