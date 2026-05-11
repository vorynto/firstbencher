"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Users, Search, CheckCircle2, XCircle, Loader2, RefreshCw, UserCheck, UserX } from "lucide-react";

type UserProfile = {
    id: string;
    full_name: string;
    email: string;
    is_active: boolean;
    created_at: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [toggling, setToggling] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch users");
            setUsers(data.users || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch users.");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleToggle = async (user: UserProfile) => {
        setToggling(user.id);
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: user.id, is_active: !user.is_active }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update user.");
        }
        setToggling(null);
    };

    const filtered = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = users.filter(u => u.is_active).length;
    const inactiveCount = users.filter(u => !u.is_active).length;

    return (
        <div className="space-y-8">
            {/* Page header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Users size={20} className="text-primary" />
                        </div>
                        Registered Users
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 ml-1">Manage user access and view all registered accounts.</p>
                </div>
                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Users", value: users.length, color: "bg-blue-50 text-blue-600", icon: Users },
                    { label: "Active", value: activeCount, color: "bg-green-50 text-green-600", icon: UserCheck },
                    { label: "Disabled", value: inactiveCount, color: "bg-red-50 text-red-600", icon: UserX },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className={`${color} rounded-2xl p-5 flex items-center gap-4`}>
                        <Icon size={24} />
                        <div>
                            <p className="text-2xl font-black">{value}</p>
                            <p className="text-xs font-bold opacity-70 uppercase tracking-wider">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-6 text-center text-red-600 text-sm font-semibold">{error}</div>
                )}

                {loading ? (
                    <div className="py-16 flex items-center justify-center gap-3 text-gray-400">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="font-medium">Loading users...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Users size={48} className="mx-auto mb-4 text-gray-200" />
                        <p className="text-gray-400 font-medium">
                            {searchTerm ? "No users match your search." : "No registered users yet."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3.5">User</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3.5">Email</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3.5">Registered</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3.5">Status</th>
                                    <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-3.5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-white font-black text-sm shrink-0">
                                                    {user.full_name?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <span className="font-bold text-gray-900 text-sm">{user.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                                            {new Date(user.created_at).toLocaleDateString("en-US", {
                                                year: "numeric", month: "short", day: "numeric"
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.is_active
                                                ? "bg-green-50 text-green-700"
                                                : "bg-red-50 text-red-700"
                                                }`}>
                                                {user.is_active ? (
                                                    <CheckCircle2 size={12} />
                                                ) : (
                                                    <XCircle size={12} />
                                                )}
                                                {user.is_active ? "Active" : "Disabled"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggle(user)}
                                                disabled={toggling === user.id}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${user.is_active
                                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                    : "bg-green-50 text-green-600 hover:bg-green-100"
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {toggling === user.id ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : user.is_active ? (
                                                    <><UserX size={12} /> Disable</>
                                                ) : (
                                                    <><UserCheck size={12} /> Enable</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
