"use client";

import { usePathname } from "next/navigation";

export default function ConditionalLayout({
    children,
    header,
    footer,
}: {
    children: React.ReactNode;
    header: React.ReactNode;
    footer: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin");

    if (isAdminRoute) {
        return <main className="min-h-screen">{children}</main>;
    }

    return (
        <>
            {header}
            <main className="min-h-screen">{children}</main>
            {footer}
        </>
    );
}
