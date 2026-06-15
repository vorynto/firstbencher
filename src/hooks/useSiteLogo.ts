"use client";

import { useState, useEffect } from "react";

export function useSiteLogo(): string {
    const [logoUrl, setLogoUrl] = useState<string>("/logo.png");

    useEffect(() => {
        fetch("/api/pages-content?page=global_settings")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.content?.logo_header) setLogoUrl(data.content.logo_header);
            })
            .catch(() => {});
    }, []);

    return logoUrl;
}
