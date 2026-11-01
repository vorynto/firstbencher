"use client";

import React, { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, User, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Props = {
    fullName: string;
    email: string;
    phone: string;
};

export default function SettingsClient({ fullName, email, phone }: Props) {
    const [profile, setProfile] = useState({ full_name: fullName, phone });
    const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [profileError, setProfileError] = useState("");

    const [passwords, setPasswords] = useState({ password: "", confirm: "" });
    const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [passwordError, setPasswordError] = useState("");

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileStatus("saving");
        setProfileError("");
        try {
            const res = await fetch("/api/portal/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to save");
            }
            setProfileStatus("saved");
            setTimeout(() => setProfileStatus("idle"), 2500);
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : "Failed to save");
            setProfileStatus("error");
        }
    };

    const savePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        if (passwords.password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            setPasswordStatus("error");
            return;
        }
        if (passwords.password !== passwords.confirm) {
            setPasswordError("Passwords do not match.");
            setPasswordStatus("error");
            return;
        }
        setPasswordStatus("saving");
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: passwords.password });
            if (error) throw error;
            setPasswords({ password: "", confirm: "" });
            setPasswordStatus("saved");
            setTimeout(() => setPasswordStatus("idle"), 2500);
        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : "Failed to update password");
            setPasswordStatus("error");
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1 font-medium">Manage your profile and account security.</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2.5">
                    <User size={18} className="text-[var(--primary)]" />
                    <h2 className="font-black text-gray-900">Profile</h2>
                </div>
                <form onSubmit={saveProfile} className="p-6 space-y-4">
                    {profileStatus === "error" && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3.5 rounded-xl border border-red-100 font-medium text-sm">
                            <AlertCircle size={16} className="shrink-0" /> {profileError}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                        <input
                            required
                            type="text"
                            value={profile.full_name}
                            onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                            <Mail size={13} /> Email
                        </label>
                        <input
                            disabled
                            type="email"
                            value={email}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="Used for payment receipts"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={profileStatus === "saving"}
                        className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-70"
                    >
                        {profileStatus === "saving" && <Loader2 size={16} className="animate-spin" />}
                        {profileStatus === "saved" && <CheckCircle2 size={16} />}
                        {profileStatus === "saving" ? "Saving..." : profileStatus === "saved" ? "Saved!" : "Save Changes"}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2.5">
                    <Lock size={18} className="text-[var(--primary)]" />
                    <h2 className="font-black text-gray-900">Change Password</h2>
                </div>
                <form onSubmit={savePassword} className="p-6 space-y-4">
                    {passwordStatus === "error" && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3.5 rounded-xl border border-red-100 font-medium text-sm">
                            <AlertCircle size={16} className="shrink-0" /> {passwordError}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                        <input
                            required
                            type="password"
                            value={passwords.password}
                            onChange={e => setPasswords({ ...passwords, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white"
                            placeholder="At least 6 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            required
                            type="password"
                            value={passwords.confirm}
                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-red-100 transition-all outline-none bg-gray-50 focus:bg-white"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={passwordStatus === "saving"}
                        className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-70"
                    >
                        {passwordStatus === "saving" && <Loader2 size={16} className="animate-spin" />}
                        {passwordStatus === "saved" && <CheckCircle2 size={16} />}
                        {passwordStatus === "saving" ? "Updating..." : passwordStatus === "saved" ? "Updated!" : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
