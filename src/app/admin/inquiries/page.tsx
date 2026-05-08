"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Mail,
    Phone,
    Clock,
    CheckCircle,
    Search,
    X,
    User,
    MessageSquare,
    BookOpen,
    RefreshCw,
    ChevronDown,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

type Inquiry = {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    status: string;
    created_at: string;
};

const STATUS_OPTIONS = ["pending", "contacted", "resolved"];

const statusStyle: Record<string, string> = {
    pending: "bg-orange-100 text-orange-600",
    contacted: "bg-blue-100 text-blue-600",
    resolved: "bg-green-100 text-green-600",
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [sortDesc, setSortDesc] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selected, setSelected] = useState<Inquiry | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const supabase = createClient();

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
            .from("inquiries")
            .select("*")
            .order("created_at", { ascending: !sortDesc });

        if (err) {
            setError(err.message);
        } else {
            setInquiries(data ?? []);
        }
        setLoading(false);
    }, [sortDesc]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    async function updateStatus(id: string, status: string) {
        setUpdatingId(id);
        const { error: err } = await supabase
            .from("inquiries")
            .update({ status })
            .eq("id", id);

        if (!err) {
            setInquiries((prev) =>
                prev.map((i) => (i.id === id ? { ...i, status } : i))
            );
            if (selected?.id === id) {
                setSelected((prev) => (prev ? { ...prev, status } : prev));
            }
        }
        setUpdatingId(null);
    }

    const filtered = inquiries.filter((i) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            i.full_name.toLowerCase().includes(q) ||
            i.email.toLowerCase().includes(q) ||
            (i.subject ?? "").toLowerCase().includes(q) ||
            (i.phone ?? "").toLowerCase().includes(q);
        const matchStatus = filterStatus === "all" || i.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const counts = {
        all: inquiries.length,
        pending: inquiries.filter((i) => i.status === "pending").length,
        contacted: inquiries.filter((i) => i.status === "contacted").length,
        resolved: inquiries.filter((i) => i.status === "resolved").length,
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-2">Inquiries</h1>
                    <p className="text-muted-foreground">
                        Manage and respond to messages from your website visitors.
                    </p>
                </div>
                <button
                    onClick={fetchInquiries}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-accent/20 text-sm font-bold transition-all"
                >
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "contacted", "resolved"] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={cn(
                            "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border",
                            filterStatus === s
                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                : "border-border bg-background text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                        <span className="ml-2 opacity-60">{counts[s]}</span>
                    </button>
                ))}
            </div>

            {/* Table card */}
            <div className="bg-background border border-border rounded-[30px] overflow-hidden shadow-sm">
                {/* Search + sort bar */}
                <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={18}
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, phone or source…"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-accent/20 outline-none focus:bg-background transition-all text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setSortDesc((v) => !v)}
                        className="flex items-center gap-2 px-5 py-3 font-bold text-sm text-foreground border border-border rounded-xl bg-background hover:bg-accent/20 transition-all shrink-0"
                    >
                        Sort: {sortDesc ? "Newest first" : "Oldest first"}
                        <ChevronDown size={16} className={cn("transition-transform", !sortDesc && "rotate-180")} />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-6 flex items-center gap-3 text-red-600 bg-red-50 border-b border-border">
                        <AlertCircle size={18} />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="p-16 text-center text-muted-foreground font-bold">
                        Loading inquiries…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center text-muted-foreground font-bold">
                        No inquiries found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-accent/30 border-b border-border text-[10px] uppercase font-black text-muted-foreground tracking-wider">
                                    <th className="px-8 py-5">Contact</th>
                                    <th className="px-8 py-5">Source</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map((inquiry) => (
                                    <tr
                                        key={inquiry.id}
                                        onClick={() => setSelected(inquiry)}
                                        className="hover:bg-accent/10 transition-colors cursor-pointer"
                                    >
                                        {/* Contact */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                                                    {inquiry.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm leading-tight">
                                                        {inquiry.full_name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                                        {inquiry.email}
                                                    </p>
                                                    {inquiry.phone && (
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {inquiry.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Source */}
                                        <td className="px-8 py-5 max-w-[260px]">
                                            <p className="text-xs font-bold text-primary truncate">
                                                {inquiry.subject ?? "—"}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-8 py-5">
                                            <span
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                    statusStyle[inquiry.status] ?? "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {inquiry.status}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Clock size={12} />
                                                <span className="text-xs font-bold">{timeAgo(inquiry.created_at)}</span>
                                            </div>
                                        </td>

                                        {/* Quick action — mark resolved */}
                                        <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                {inquiry.status !== "resolved" && (
                                                    <button
                                                        onClick={() => updateStatus(inquiry.id, "resolved")}
                                                        disabled={updatingId === inquiry.id}
                                                        title="Mark resolved"
                                                        className="p-2 rounded-lg border border-border bg-background hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all disabled:opacity-40"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelected(inquiry)}
                                                    title="View details"
                                                    className="p-2 rounded-lg bg-primary text-white hover:opacity-90 transition-all"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail panel */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black/40 backdrop-blur-sm"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="relative w-full sm:w-[520px] max-h-[90vh] overflow-y-auto bg-background rounded-t-[30px] sm:rounded-[30px] sm:mr-6 shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Panel header */}
                        <div className="flex items-center justify-between p-8 border-b border-border shrink-0">
                            <h2 className="text-xl font-black">Inquiry Details</h2>
                            <button
                                onClick={() => setSelected(null)}
                                className="p-2 rounded-xl hover:bg-accent/20 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Panel body */}
                        <div className="p-8 flex flex-col gap-6">
                            {/* Contact info */}
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl shrink-0">
                                    {selected.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg leading-tight">{selected.full_name}</h3>
                                    <a
                                        href={`mailto:${selected.email}`}
                                        className="flex items-center gap-1.5 text-sm text-primary font-bold mt-1 hover:underline"
                                    >
                                        <Mail size={13} />
                                        {selected.email}
                                    </a>
                                    {selected.phone && (
                                        <a
                                            href={`tel:${selected.phone}`}
                                            className="flex items-center gap-1.5 text-sm text-muted-foreground font-bold mt-0.5 hover:underline"
                                        >
                                            <Phone size={13} />
                                            {selected.phone}
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Source */}
                            {selected.subject && (
                                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                                        <BookOpen size={12} />
                                        Source / Origin
                                    </div>
                                    <p className="text-sm font-bold text-foreground">{selected.subject}</p>
                                </div>
                            )}

                            {/* Message */}
                            <div className="bg-accent/30 border border-border rounded-2xl p-5">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                                    <User size={12} />
                                    Message
                                </div>
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    &quot;{selected.message}&quot;
                                </p>
                            </div>

                            {/* Meta */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold">
                                <Clock size={13} />
                                {formatDate(selected.created_at)}
                            </div>

                            {/* Status update */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                                    Update Status
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {STATUS_OPTIONS.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => updateStatus(selected.id, s)}
                                            disabled={updatingId === selected.id || selected.status === s}
                                            className={cn(
                                                "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border disabled:opacity-50",
                                                selected.status === s
                                                    ? cn("border-transparent", statusStyle[s])
                                                    : "border-border bg-background hover:bg-accent/20"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
