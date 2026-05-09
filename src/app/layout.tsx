import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlobalSettingsProvider from "@/components/layout/GlobalSettingsProvider";
import { EnquiryProvider } from "@/components/EnquiryModal";
import { JsonLd } from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

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

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="scroll-pt-30" style={{ colorScheme: "light" }}>
            <body
                suppressHydrationWarning
                className={`${inter.variable} font-sans antialiased bg-background text-foreground overflow-x-hidden`}
            >
                <JsonLd data={organizationJsonLd} />
                <JsonLd data={websiteJsonLd} />
                <GlobalSettingsProvider>
                    <EnquiryProvider>
                        <ConditionalLayout header={<Header />} footer={<Footer />}>
                            {children}
                        </ConditionalLayout>
                    </EnquiryProvider>
                </GlobalSettingsProvider>
            </body>
        </html>
    );
}
