import React from "react";
import Link from "next/link";
import { GraduationCap, FileText, Mail, Calendar, Briefcase, BookOpen, Users, Star } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ── helpers ──────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name: string): string {
    return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const statusColor: Record<string, string> = {
    pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
    contacted:  "bg-blue-50 text-blue-700 border-blue-200",
    resolved:   "bg-green-50 text-green-700 border-green-200",
    closed:     "bg-gray-100 text-gray-500 border-gray-200",
};

// ── page ─────────────────────────────────────────────────────────
export default async function Dashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    // Parallel fetches
    const [
        { count: totalCourses },
        { count: totalInquiries },
        { count: todayInquiries },
        { count: pendingInquiries },
        { count: totalBlogs },
        { count: totalWorkshops },
        { count: totalJobs },
        { count: totalApplications },
        { count: newCoursesThisMonth },
        { data: recentInquiries },
    ] = await Promise.all([
        supabaseAdmin.from("courses").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("inquiries").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("inquiries").select("*", { count: "exact", head: true }).gte("created_at", todayIso),
        supabaseAdmin.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabaseAdmin.from("blogs").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("events").select("*", { count: "exact", head: true }).eq("active", true),
        supabaseAdmin.from("jobs").select("*", { count: "exact", head: true }).eq("active", true),
        supabaseAdmin.from("applications").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("courses").select("*", { count: "exact", head: true }).gte("created_at", thisMonthStart),
        supabaseAdmin.from("inquiries")
            .select("id, full_name, subject, status, created_at")
            .order("created_at", { ascending: false })
            .limit(6),
    ]);

    const stats = [
        {
            label: "Total Courses",
            value: totalCourses ?? 0,
            trend: newCoursesThisMonth ? `+${newCoursesThisMonth} this month` : "No new courses",
            icon: GraduationCap,
            color: "text-blue-500",
            bg: "bg-blue-50",
            href: "/admin/courses",
        },
        {
            label: "Total Inquiries",
            value: totalInquiries ?? 0,
            trend: todayInquiries ? `+${todayInquiries} today` : "None today",
            icon: Mail,
            color: "text-[var(--primary)]",
            bg: "bg-primary-tint",
            href: "/admin/inquiries",
        },
        {
            label: "Pending Inquiries",
            value: pendingInquiries ?? 0,
            trend: pendingInquiries ? "Needs attention" : "All resolved",
            icon: Mail,
            color: "text-orange-500",
            bg: "bg-orange-50",
            href: "/admin/inquiries",
        },
        {
            label: "Blog Posts",
            value: totalBlogs ?? 0,
            trend: "Published",
            icon: BookOpen,
            color: "text-purple-500",
            bg: "bg-purple-50",
            href: "/admin/blog",
        },
        {
            label: "Active Workshops",
            value: totalWorkshops ?? 0,
            trend: "Upcoming sessions",
            icon: Calendar,
            color: "text-teal-500",
            bg: "bg-teal-50",
            href: "/admin/workshops",
        },
        {
            label: "Open Positions",
            value: totalJobs ?? 0,
            trend: `${totalApplications ?? 0} applications`,
            icon: Briefcase,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
            href: "/admin/career",
        },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-black text-foreground mb-2">Welcome Back, Admin</h1>
                <p className="text-muted-foreground">Here&apos;s a live summary of your platform.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.href}
                        className="bg-background p-6 rounded-[24px] border border-border hover:shadow-lg hover:border-[var(--primary)]/30 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-4xl font-black text-foreground mb-1 group-hover:text-[var(--primary)] transition-colors">
                            {stat.value.toLocaleString()}
                        </h3>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-tight">{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Recent Inquiries + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Recent Inquiries */}
                <div className="bg-background p-8 rounded-[30px] border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Recent Inquiries</h3>
                        <Link href="/admin/inquiries" className="text-xs font-bold text-[var(--primary)] hover:underline">
                            View all →
                        </Link>
                    </div>

                    {recentInquiries && recentInquiries.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {recentInquiries.map((inq) => (
                                <Link
                                    key={inq.id}
                                    href="/admin/inquiries"
                                    className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-transparent hover:border-border transition-all"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-xs shrink-0">
                                            {initials(inq.full_name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm truncate">{inq.full_name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{inq.subject || "General inquiry"}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusColor[inq.status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                            {inq.status}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-medium">{timeAgo(inq.created_at)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Mail size={32} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium">No inquiries yet</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-background p-8 rounded-[30px] border border-border">
                    <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Add Course",     icon: GraduationCap, href: "/admin/courses" },
                            { label: "New Blog Post",  icon: BookOpen,      href: "/admin/blog" },
                            { label: "Add Workshop",   icon: Calendar,      href: "/admin/workshops" },
                            { label: "Post Job",       icon: Briefcase,     href: "/admin/career" },
                            { label: "View Inquiries", icon: Mail,          href: "/admin/inquiries" },
                            { label: "Manage Users",   icon: Users,         href: "/admin/users" },
                            { label: "Success Stories",icon: Star,          href: "/admin/success-stories" },
                            { label: "Site Settings",  icon: FileText,      href: "/admin/settings" },
                        ].map(({ label, icon: Icon, href }) => (
                            <Link
                                key={label}
                                href={href}
                                className="p-4 rounded-2xl border-2 border-dashed border-border hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all flex items-center gap-3 group"
                            >
                                <Icon size={18} className="text-[var(--primary)] shrink-0" />
                                <span className="text-sm font-bold group-hover:text-[var(--primary)] transition-colors">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
