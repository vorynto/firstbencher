import { NextRequest, NextResponse } from "next/server";

// Best-effort IP → country lookup used to pre-select a currency for the
// visitor. Never blocks the page: any failure (private/loopback IP in local
// dev, network error, rate limit) just returns a null country_code, and the
// caller (CountryProvider) falls back to the first configured country.
export async function GET(req: NextRequest) {
    try {
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "";

        const url = ip
            ? `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`
            : `http://ip-api.com/json/?fields=status,countryCode`;

        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) return NextResponse.json({ country_code: null });

        const data = await res.json();
        if (data.status !== "success" || !data.countryCode) {
            return NextResponse.json({ country_code: null });
        }
        return NextResponse.json({ country_code: data.countryCode as string });
    } catch {
        return NextResponse.json({ country_code: null });
    }
}
