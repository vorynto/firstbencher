"use client";

import Sidebar from "@/components/admin/layout/Sidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage) {
        return <div className="min-h-screen bg-background">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-accent/20">
            <Sidebar />
            <div className="lg:pl-64">
                <header className="h-20 bg-background border-b flex items-center justify-between px-8 sticky top-0 z-30">
                    <h2 className="text-lg font-bold text-foreground">Admin Portal</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold">Admin User</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Super Admin</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">
                            A
                        </div>
                    </div>
                </header>
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

