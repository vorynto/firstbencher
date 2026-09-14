"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Country, CountryPrice, getPriceForCountry, formatPrice } from "@/lib/countries";

const STORAGE_KEY = "fb_selected_country";

type CountryContextType = {
    countries: Country[];
    selectedCountry: Country | null;
    setSelectedCountryCode: (code: string) => void;
    ccavenueEnabled: boolean;
    loading: boolean;
    /** Resolve a course's country_prices to the selected country's price, or null (→ "Contact us for pricing"). */
    getDisplayPrice: (countryPrices: CountryPrice[] | undefined | null) => { amount: number; formatted: string } | null;
};

const CountryContext = createContext<CountryContextType>({
    countries: [],
    selectedCountry: null,
    setSelectedCountryCode: () => {},
    ccavenueEnabled: false,
    loading: true,
    getDisplayPrice: () => null,
});

export function useCountry() {
    return useContext(CountryContext);
}

/**
 * Loads the admin-managed countries + CC Avenue toggle once (payment_settings),
 * resolves the visitor's country (saved choice → IP geolocation → first
 * configured country), and persists any manual switch to localStorage so it's
 * consistent across the header, footer, and course pages.
 */
export function CountryProvider({ children }: { children: React.ReactNode }) {
    const [countries, setCountries] = useState<Country[]>([]);
    const [ccavenueEnabled, setCcavenueEnabled] = useState(false);
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            let loadedCountries: Country[] = [];
            let enabled = false;
            try {
                const res = await fetch("/api/pages-content?page=payment_settings");
                if (res.ok) {
                    const data = await res.json();
                    loadedCountries = Array.isArray(data.content?.countries) ? data.content.countries : [];
                    enabled = !!data.content?.ccavenue_enabled;
                }
            } catch {
                // no settings configured yet — leave countries empty
            }
            if (cancelled) return;
            setCountries(loadedCountries);
            setCcavenueEnabled(enabled);

            if (loadedCountries.length === 0) {
                setLoading(false);
                return;
            }

            // 1. A previously saved manual choice always wins.
            const saved = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
            if (saved && loadedCountries.some(c => c.code === saved)) {
                setSelectedCode(saved);
                setLoading(false);
                return;
            }

            // 2. Otherwise auto-detect via IP geolocation.
            try {
                const geoRes = await fetch("/api/geo");
                const geoData = await geoRes.json();
                const detected = geoData.country_code as string | null;
                if (!cancelled && detected && loadedCountries.some(c => c.code === detected)) {
                    setSelectedCode(detected);
                    setLoading(false);
                    return;
                }
            } catch {
                // ignore — fall through to the default below
            }

            // 3. Fallback: first configured country.
            if (!cancelled) {
                setSelectedCode(loadedCountries[0].code);
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const setSelectedCountryCode = useCallback((code: string) => {
        setSelectedCode(code);
        try {
            window.localStorage.setItem(STORAGE_KEY, code);
        } catch {
            // localStorage unavailable (private mode, etc.) — selection just won't persist
        }
    }, []);

    const selectedCountry = countries.find(c => c.code === selectedCode) || null;

    const getDisplayPrice = useCallback(
        (countryPrices: CountryPrice[] | undefined | null) => {
            if (!selectedCountry) return null;
            const amount = getPriceForCountry(countryPrices, selectedCountry.code);
            if (amount == null) return null;
            return { amount, formatted: formatPrice(amount, selectedCountry.currency_symbol) };
        },
        [selectedCountry]
    );

    return (
        <CountryContext.Provider
            value={{ countries, selectedCountry, setSelectedCountryCode, ccavenueEnabled, loading, getDisplayPrice }}
        >
            {children}
        </CountryContext.Provider>
    );
}
