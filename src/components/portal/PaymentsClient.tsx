"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Clock, AlertTriangle, CreditCard, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/countries";

export type OrderRow = {
    orderRef: string;
    courseTitle: string;
    amount: number;
    currencyCode: string;
    status: string;
    paymentMode: string | null;
    trackingId: string | null;
    failureMessage: string | null;
    createdAt: string;
};

const STATUS_META: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
    success: { label: "Paid", cls: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    failed: { label: "Failed", cls: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
    cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-500 border-gray-200", icon: XCircle },
};

function currencySymbol(code: string) {
    return code === "INR" ? "₹" : code === "USD" ? "$" : code === "EUR" ? "€" : code === "GBP" ? "£" : code + " ";
}

export default function PaymentsClient({ orders }: { orders: OrderRow[] }) {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");
    const highlightedRef = searchParams.get("order");

    const banner =
        status === "success"
            ? { cls: "bg-green-50 border-green-200 text-green-700", icon: CheckCircle2, msg: "Payment successful! Your course is now unlocked — check My Courses." }
            : status === "failed"
                ? { cls: "bg-red-50 border-red-200 text-red-700", icon: XCircle, msg: "Payment failed. No amount was charged — you can try again from the course page." }
                : status === "cancelled"
                    ? { cls: "bg-gray-50 border-gray-200 text-gray-600", icon: AlertTriangle, msg: "Payment was cancelled." }
                    : status === "error"
                        ? { cls: "bg-red-50 border-red-200 text-red-700", icon: AlertTriangle, msg: "Something went wrong confirming your payment. If you were charged, please contact support with your order reference." }
                        : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Payments</h1>
                <p className="text-gray-500 mt-1 font-medium">Your full payment history and status.</p>
            </div>

            {banner && (
                <div className={`flex items-center gap-3 border rounded-2xl px-5 py-4 font-semibold text-sm ${banner.cls}`}>
                    <banner.icon size={20} className="shrink-0" />
                    {banner.msg}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-16 text-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard size={26} className="text-[var(--primary)]/50" />
                    </div>
                    <h3 className="font-black text-gray-900 mb-2">No payments yet</h3>
                    <p className="text-gray-500 mb-6 px-4">Your payment history will show up here once you purchase a course.</p>
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 bg-[var(--primary)] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
                    >
                        Browse Courses <ArrowRight size={15} />
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="divide-y divide-gray-50">
                        {orders.map(o => {
                            const meta = STATUS_META[o.status] || STATUS_META.cancelled;
                            const isHighlighted = highlightedRef === o.orderRef;
                            return (
                                <div
                                    key={o.orderRef}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 ${isHighlighted ? "bg-accent/40" : ""}`}
                                >
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 text-sm truncate">{o.courseTitle}</p>
                                        <p className="text-xs text-gray-400 mt-1 font-mono">{o.orderRef}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(o.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            {o.paymentMode ? ` · ${o.paymentMode}` : ""}
                                        </p>
                                        {o.status === "failed" && o.failureMessage && (
                                            <p className="text-xs text-red-500 mt-1">{o.failureMessage}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                                        <span className="font-black text-gray-900">
                                            {formatPrice(o.amount, currencySymbol(o.currencyCode))}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full border ${meta.cls}`}>
                                            <meta.icon size={12} />
                                            {meta.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
