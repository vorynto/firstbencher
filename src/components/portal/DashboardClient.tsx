"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, CreditCard, Clock, Star, ArrowRight, BookOpen } from "lucide-react";
import { formatPrice } from "@/lib/countries";

export type RecentOrder = {
    orderRef: string;
    courseTitle: string;
    amount: number;
    currencyCode: string;
    status: string;
    createdAt: string;
};

type Props = {
    fullName: string;
    enrolledCount: number;
    successPaymentsCount: number;
    pendingCount: number;
    storiesCount: number;
    recentOrders: RecentOrder[];
};

const STATUS_STYLES: Record<string, string> = {
    success: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function DashboardClient({
    fullName,
    enrolledCount,
    successPaymentsCount,
    pendingCount,
    storiesCount,
    recentOrders,
}: Props) {
    const firstName = fullName.split(" ")[0];

    const stats = [
        { label: "Enrolled Courses", value: enrolledCount, icon: GraduationCap, href: "/portal/courses" },
        { label: "Completed Payments", value: successPaymentsCount, icon: CreditCard, href: "/portal/payments" },
        { label: "Pending Payments", value: pendingCount, icon: Clock, href: "/portal/payments" },
        { label: "Stories Shared", value: storiesCount, icon: Star, href: "/portal/success-stories" },
    ];

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Welcome back, {firstName} 👋</h1>
                <p className="text-gray-500 mt-1 font-medium">Here&apos;s a snapshot of your learning journey.</p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                        <Link
                            href={s.href}
                            className="block bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-lg transition-all"
                        >
                            <div className="w-11 h-11 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-4">
                                <s.icon size={20} />
                            </div>
                            <p className="text-2xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs font-bold text-gray-500 mt-1">{s.label}</p>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="font-black text-gray-900">Recent Payments</h2>
                    <Link href="/portal/payments" className="text-xs font-bold text-[var(--primary)] flex items-center gap-1 hover:gap-2 transition-all">
                        View all <ArrowRight size={14} />
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={26} className="text-[var(--primary)]/50" />
                        </div>
                        <p className="text-gray-500 font-medium mb-5">You haven&apos;t purchased any courses yet.</p>
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 bg-[var(--primary)] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
                        >
                            Browse Courses <ArrowRight size={15} />
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {recentOrders.map(o => (
                            <div key={o.orderRef} className="flex items-center justify-between gap-4 px-6 py-4">
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{o.courseTitle}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(o.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-bold text-gray-900 text-sm">
                                        {formatPrice(o.amount, o.currencyCode === "INR" ? "₹" : o.currencyCode + " ")}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_STYLES[o.status] || STATUS_STYLES.cancelled}`}>
                                        {o.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
