import React from "react";
import { Award, LucideIcon } from "lucide-react";

interface PageHeroProps {
    title?: string;
    subtitle?: string;
    badgeText?: string;
    badgeIcon?: LucideIcon;
    highlightedTitle?: string;
    className?: string;
    children?: React.ReactNode;
}

export default function PageHero({
    title,
    subtitle,
    badgeText,
    badgeIcon: BadgeIcon = Award,
    highlightedTitle,
    className,
    children
}: PageHeroProps) {
    return (
        <div className="relative py-14 overflow-hidden" style={{ background: "linear-gradient(135deg, var(--primary-tint) 0%, color-mix(in srgb, var(--primary) 10%, white) 50%, var(--primary-tint) 100%)" }}>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                {children ? (
                    children
                ) : (
                    <>
                        {badgeText && (
                            <div className="inline-flex items-center gap-2 bg-primary-tint px-4 py-2 rounded-full text-[var(--primary)] text-xs font-black uppercase tracking-widest mb-6 border border-[var(--primary)]/15 shadow-sm">
                                <BadgeIcon size={16} /> {badgeText}
                            </div>
                        )}
                        {title && (
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight text-gray-900">
                                {title} {highlightedTitle && <span className="text-[var(--primary)]">{highlightedTitle}</span>}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-medium">
                                {subtitle}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
