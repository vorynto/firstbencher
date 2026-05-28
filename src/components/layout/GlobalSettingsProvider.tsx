"use client";

import React, { useEffect } from "react";

/**
 * GlobalSettingsProvider
 * 
 * This component fetches the `global_settings` configuration from the CMS DB
 * on initial load and maps those dynamic values directly into CSS root variables
 * allowing Tailwind to react instantly to admin-defined overrides without rebuilds.
 */
export default function GlobalSettingsProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const fetchGlobalSettings = async () => {
            try {
                const res = await fetch("/api/pages-content?page=global_settings");
                if (res.ok) {
                    const data = await res.json();
                    const settings = data.content;

                    if (settings) {
                        const root = document.documentElement;
                        // Map CMS values to Tailwind CSS Variables
                        if (settings.primary_color) root.style.setProperty("--primary", settings.primary_color);
                        if (settings.secondary_color) root.style.setProperty("--secondary", settings.secondary_color);
                        if (settings.accent_color) root.style.setProperty("--accent", settings.accent_color);
                        // Keep --primary-dark in sync with the button hover colour (both represent the darker shade)
                        if (settings.button_hover_bg) root.style.setProperty("--primary-dark", settings.button_hover_bg);
                        
                        // Font logic (dynamically inject Google Fonts if specified)
                        if (settings.font_family) {
                            root.style.setProperty("--font-sans", `"${settings.font_family}", sans-serif`);
                            injectGoogleFont(settings.font_family);
                        }
                        
                        // Button colors mapping (requires globals.css adjustments)
                        if (settings.button_bg) root.style.setProperty("--button-bg", settings.button_bg);
                        if (settings.button_text) root.style.setProperty("--button-text", settings.button_text);
                        if (settings.button_hover_bg) root.style.setProperty("--button-hover-bg", settings.button_hover_bg);
                        if (settings.button_hover_text) root.style.setProperty("--button-hover-text", settings.button_hover_text);
                    }
                }
            } catch (error) {
                console.error("Error loading global settings:", error);
            }
        };

        fetchGlobalSettings();
    }, []);

    return <>{children}</>;
}

// Utility to inject Google Fonts stylesheet dynamically
function injectGoogleFont(fontFamily: string) {
    // Basic normalization of font string for URL
    const formattedName = fontFamily.replace(/ /g, "+");
    const linkId = `google-font-${formattedName}`;
    
    if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;600;700;800&display=swap`;
        document.head.appendChild(link);
    }
}
