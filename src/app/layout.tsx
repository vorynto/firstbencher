import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlobalCtaBar from "@/components/ui/GlobalCtaBar";
import GlobalSettingsProvider from "@/components/layout/GlobalSettingsProvider";
import { EnquiryProvider } from "@/components/EnquiryModal";
import { JsonLd } from "@/components/JsonLd";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import CustomCodeInjector from "@/components/layout/CustomCodeInjector";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

// Cached fetch — re-validates every 60 seconds so new scripts go live quickly
const getCustomCode = unstable_cache(
    async () => {
        const { data } = await supabaseAdmin
            .from("pages_content")
            .select("content")
            .eq("page_name", "custom_code")
            .single();
        return {
            header_code: (data?.content?.header_code as string) || "",
            body_code: (data?.content?.body_code as string) || "",
        };
    },
    ["custom_code"],
    { revalidate: 60 }
);

// Cached fetch of global settings — injected as inline <style> so CSS variables
// are correct on the very first paint, eliminating the red flash before JS loads.
const getGlobalSettings = unstable_cache(
    async () => {
        const { data } = await supabaseAdmin
            .from("pages_content")
            .select("content")
            .eq("page_name", "global_settings")
            .single();
        return (data?.content ?? {}) as Record<string, string>;
    },
    ["global_settings_layout"],
    { revalidate: 60 }
);

function buildCssVars(s: Record<string, string>): string {
    const pairs: string[] = [];
    if (s.primary_color)    pairs.push(`--primary:${s.primary_color}`);
    if (s.button_hover_bg)  pairs.push(`--primary-dark:${s.button_hover_bg}`);
    if (s.secondary_color)  pairs.push(`--secondary:${s.secondary_color}`);
    if (s.accent_color)     pairs.push(`--accent:${s.accent_color}`);
    if (s.button_bg)        pairs.push(`--button-bg:${s.button_bg}`);
    if (s.button_text)      pairs.push(`--button-text:${s.button_text}`);
    if (s.button_hover_bg)  pairs.push(`--button-hover-bg:${s.button_hover_bg}`);
    if (s.button_hover_text) pairs.push(`--button-hover-text:${s.button_hover_text}`);
    return pairs.length ? `:root{${pairs.join(';')}}` : "";
}

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
    preload: true,
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "First Bencher | Expert Training & Consulting",
        template: "%s | First Bencher",
    },
    description:
        "First Bencher provides expert training and consulting in Project Management, PMP, AI, Machine Learning, and more. Join 10,000+ certified professionals worldwide.",
    keywords: [
        "project management training",
        "PMP certification",
        "AI training",
        "machine learning course",
        "First Bencher",
        "professional certification",
        "online training",
        "consulting",
    ],
    authors: [{ name: "First Bencher", url: SITE_URL }],
    creator: "First Bencher",
    publisher: "First Bencher",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: SITE_URL,
        siteName: "First Bencher",
        title: "First Bencher | Expert Training & Consulting",
        description:
            "Join 10,000+ certified professionals. Expert training in Project Management, AI, Machine Learning, and more.",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "First Bencher — Expert Training & Consulting",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@firstbencher",
        creator: "@firstbencher",
        title: "First Bencher | Expert Training & Consulting",
        description:
            "Join 10,000+ certified professionals. Expert training in PM, AI, and more.",
        images: ["/og-image.jpg"],
    },
    alternates: { canonical: SITE_URL },
    verification: {
        // Add your actual verification tokens here
        // google: "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN",
        // yandex: "YOUR_YANDEX_TOKEN",
    },
};

const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "First Bencher",
    url: SITE_URL,
    logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
    },
    sameAs: [
        "https://www.linkedin.com/company/firstbencher",
        "https://twitter.com/firstbencher",
    ],
    contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: "English",
    },
};

const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "First Bencher",
    url: SITE_URL,
    potentialAction: {
        "@type": "SearchAction",
        target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/courses?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
    },
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const [{ header_code, body_code }, globalSettings] = await Promise.all([
        getCustomCode(),
        getGlobalSettings(),
    ]);
    const cssVars = buildCssVars(globalSettings);

    return (
        <html lang="en" className="scroll-pt-30" style={{ colorScheme: "light" }}>
            {/* Inject correct CSS variables before first paint — prevents color flash */}
            {cssVars && <style dangerouslySetInnerHTML={{ __html: cssVars }} />}
            <body
                suppressHydrationWarning
                className={`${inter.variable} font-sans antialiased bg-background text-foreground overflow-x-hidden`}
            >
                {/* Injects admin-configured tracking scripts into <head> and <body> */}
                {(header_code || body_code) && (
                    <CustomCodeInjector headCode={header_code} bodyCode={body_code} />
                )}
                <JsonLd data={organizationJsonLd} />
                <JsonLd data={websiteJsonLd} />
                <GlobalSettingsProvider>
                    <EnquiryProvider>
                        <ConditionalLayout header={<Header />} footer={<Footer />} floatingContact={<GlobalCtaBar />}>
                            {children}
                        </ConditionalLayout>
                    </EnquiryProvider>
                </GlobalSettingsProvider>
            </body>
        </html>
    );
}
