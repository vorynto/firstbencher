"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    className?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    // Local overrides
    bg?: string;
    textColor?: string;
    hoverBg?: string;
    hoverTextColor?: string;
}

export default function Button({
    children,
    href,
    onClick,
    className,
    variant = "primary",
    size = "md",
    type = "button",
    disabled = false,
    bg,
    textColor,
    hoverBg,
    hoverTextColor
}: ButtonProps) {
    
    // Determine the base styles based on variant
    const variantStyles = {
        primary: "bg-[var(--button-bg)] text-[var(--button-text)] hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-text)] shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
        outline: "bg-transparent border-2 border-[var(--button-bg)] text-[var(--button-bg)] hover:bg-[var(--button-bg)] hover:text-[var(--button-text)]",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    };

    const sizeStyles = {
        sm: "px-4 py-2 text-xs",
        md: "px-8 py-3.5 text-sm",
        lg: "px-10 py-4 text-base",
    };

    // Construct inline styles for local overrides
    const inlineStyles: React.CSSProperties = {};
    if (bg) inlineStyles.backgroundColor = bg;
    if (textColor) inlineStyles.color = textColor;
    
    // For hover overrides, we'd normally need a more complex solution (like a styled-component or a custom hook)
    // because CSS variables are at the element level but hover is a pseudo-class.
    // However, we can use local CSS variables on the element itself to override the global ones!
    if (bg) (inlineStyles as any)["--button-bg"] = bg;
    if (textColor) (inlineStyles as any)["--button-text"] = textColor;
    if (hoverBg) (inlineStyles as any)["--button-hover-bg"] = hoverBg;
    if (hoverTextColor) (inlineStyles as any)["--button-hover-text"] = hoverTextColor;

    const combinedClassName = cn(
        "inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
    );

    if (href) {
        return (
            <Link href={href} className={combinedClassName} style={inlineStyles}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={combinedClassName}
            style={inlineStyles}
        >
            {children}
        </button>
    );
}
