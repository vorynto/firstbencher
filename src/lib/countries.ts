// Shared types + helpers for admin-managed countries and per-course,
// per-country pricing. Settings are stored via the generic pages_content
// mechanism at page_name = "payment_settings"; see admin/settings (Payments
// tab) and admin/courses (Country Pricing section).

export type Country = {
    code: string; // ISO 3166-1 alpha-2, e.g. "IN", "US" — matches geo-IP lookups
    name: string; // e.g. "India"
    currency_code: string; // e.g. "INR"
    currency_symbol: string; // e.g. "₹"
};

export type PaymentSettings = {
    countries: Country[];
    ccavenue_enabled: boolean;
};

export type CountryPrice = {
    country_code: string;
    price: number;
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
    countries: [],
    ccavenue_enabled: false,
};

/** Look up the configured price for a country from a course's country_prices array. */
export function getPriceForCountry(
    countryPrices: CountryPrice[] | undefined | null,
    countryCode: string | undefined | null
): number | null {
    if (!countryPrices || !countryCode) return null;
    const match = countryPrices.find(
        cp => cp.country_code.toUpperCase() === countryCode.toUpperCase()
    );
    return match ? match.price : null;
}

/** Format a numeric amount with a currency symbol, e.g. formatPrice(25000, "₹") → "₹25,000" */
export function formatPrice(amount: number, symbol: string): string {
    return `${symbol}${amount.toLocaleString("en-US")}`;
}
