import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import PageHero from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { generateSlug } from "@/lib/utils";
import { JsonLd } from "@/components/JsonLd";
import { sanitize } from "@/lib/sanitize";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
    const { data } = await supabaseAdmin.from("events").select("title");
    return (data || []).map(w => ({ slug: generateSlug(w.title) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { data: workshops } = await supabaseAdmin
        .from("events")
        .select("title, description, image_url, event_date");
    const w = workshops?.find(x => generateSlug(x.title) === slug);

    if (!w) return { title: "Workshop Not Found | First Bencher" };

    const title = `${w.title} | Live Workshop`;
    const description =
        w.description?.replace(/<[^>]+>/g, "").substring(0, 160) ||
        `Join the ${w.title} live workshop at First Bencher.`;
    const url = `${SITE_URL}/workshops/${slug}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            type: "website",
            url,
            title,
            description,
            images: w.image_url
                ? [{ url: w.image_url, width: 1200, height: 630, alt: w.title }]
                : [],
        },
        twitter: { card: "summary_large_image", title, description },
    };
}

export default async function WorkshopDetailPage({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: workshops, error } = await supabase.from("events").select("*");
    const workshop = workshops?.find(w => generateSlug(w.title) === slug);

    if (error || !workshop) notFound();

    const workshopDate = new Date(workshop.event_date);
    const isPast = workshopDate < new Date();
    const workshopUrl = `${SITE_URL}/workshops/${slug}`;

    const eventJsonLd = {
        "@context": "https://schema.org",
        "@type": "Event",
        name: workshop.title,
        description: workshop.description?.replace(/<[^>]+>/g, "").substring(0, 200) || "",
        startDate: workshop.event_date,
        endDate: workshop.event_date,
        url: workshopUrl,
        organizer: {
            "@type": "Organization",
            name: "First Bencher",
            url: SITE_URL,
        },
        location: workshop.location
            ? { "@type": "Place", name: workshop.location }
            : { "@type": "VirtualLocation", url: SITE_URL },
        eventStatus: isPast
            ? "https://schema.org/EventScheduled"
            : "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
        ...(workshop.image_url && { image: workshop.image_url }),
    };

    return (
        <>
            <JsonLd data={eventJsonLd} />
            <main className="min-h-screen bg-background">
                <PageHero
                    title={workshop.title}
                    subtitle="Exclusive Live Event Registration"
                    badgeText={workshop.category || "Workshop"}
                />

                <section className="py-20 px-8">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <Link href="/workshops" className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all font-bold">
                            <ArrowLeft size={20} /> Back to Workshops
                        </Link>

                        <div className="bg-white rounded-4xl rounded-tl-[100px] border border-border/50 shadow-2xl overflow-hidden shadow-primary/5">
                            {/* Cover Image */}
                            <div className="relative h-72 md:h-96 w-full bg-accent/20">
                                {workshop.image_url ? (
                                    <Image
                                        src={workshop.image_url}
                                        alt={workshop.title}
                                        fill
                                        priority
                                        sizes="(max-width: 768px) 100vw, 896px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full w-full bg-muted">
                                        <ImageIcon size={64} className="text-muted-foreground/30" />
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-linear-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-4 text-white">
                                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 font-bold">
                                        <Calendar className="text-primary" size={20} />
                                        <span>
                                            {workshopDate.toLocaleDateString(undefined, {
                                                weekday: "long", year: "numeric", month: "long", day: "numeric",
                                            })}
                                            <span className="mx-2">at</span>
                                            {workshopDate.toLocaleTimeString(undefined, {
                                                hour: "2-digit", minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 font-bold">
                                        <MapPin className="text-primary" size={20} />
                                        <span>{workshop.location}</span>
                                    </div>
                                    {!workshop.active && (
                                        <div className="flex items-center gap-2 bg-red-500/80 backdrop-blur-md px-4 py-3 rounded-xl border border-red-500/50 font-bold ml-auto">
                                            Draft Mode
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-12 space-y-8">
                                <div className="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-a:text-primary prose-img:rounded-3xl">
                                    <div dangerouslySetInnerHTML={{ __html: sanitize(workshop.description) }} />
                                </div>

                                <div className="pt-8 border-t border-border mt-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-accent/10 p-8 rounded-3xl">
                                    <div>
                                        <h3 className="text-2xl font-black mb-2">Ready to master your skills?</h3>
                                        <p className="text-muted-foreground">Limited spots available. Secure your access now.</p>
                                    </div>
                                    <Link
                                        href={`/contact?subject=Register%20for%20workshop:%20${encodeURIComponent(workshop.title)}`}
                                        className={`inline-flex min-w-50 items-center justify-center gap-3 px-8 py-5 rounded-2xl font-bold transition-all shadow-xl ${isPast ? "bg-muted text-muted-foreground pointer-events-none" : "bg-[#a60303] text-white hover:scale-105 shadow-[#a60303]/20 hover:shadow-[#a60303]/40"}`}
                                    >
                                        {isPast ? "Event Concluded" : "Register Now"}
                                        {!isPast && <ExternalLink size={20} />}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
