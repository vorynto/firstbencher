import { createServerSupabaseClient } from "@/lib/supabase-server";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import ContactForm from "./ContactForm";

type ContactHeader = { title: string; subtitle: string; office_hours: string; };
type Branch = { office_name: string; address: string };
type ContactDetails = { email: string; phone: string; address: string; map_embed_url: string; branches?: Branch[]; };

const defaultHeader: ContactHeader = {
    title: "Get In Touch",
    subtitle: "Have a question or want to enroll? Our team is here to help you.",
    office_hours: "Mon – Fri: 9:00 AM – 6:00 PM (GMT)",
};
const defaultDetails: ContactDetails = {
    email: "info@firstbencher.com",
    phone: "+1 (234) 567-8900",
    address: "123 Business Avenue, New York, NY 10001, USA",
    map_embed_url: "",
    branches: [],
};

async function fetchSection<T>(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, key: string, defaults: T): Promise<T> {
    try {
        const { data } = await supabase.from("pages_content").select("content").eq("page_name", key).single();
        if (data?.content) return { ...defaults, ...(data.content as Partial<T>) };
    } catch { /* ignore */ }
    return defaults;
}

import PageHero from "@/components/ui/PageHero";

export default async function ContactPage() {
    const supabase = await createServerSupabaseClient();
    const [header, details] = await Promise.all([
        fetchSection<ContactHeader>(supabase, "contact_header", defaultHeader),
        fetchSection<ContactDetails>(supabase, "contact_details", defaultDetails),
    ]);

    const contactItems = [
        { icon: Mail, label: "Email Us", value: details.email, href: `mailto:${details.email}`, color: "bg-blue-50 text-blue-600" },
        { icon: Phone, label: "Call Us", value: details.phone, href: `tel:${details.phone}`, color: "bg-green-50 text-green-600" },
        { icon: MapPin, label: "Visit Us", value: details.address, href: "#map", color: "bg-orange-50 text-orange-600" },
        { icon: Clock, label: "Office Hours", value: header.office_hours, href: undefined, color: "bg-purple-50 text-purple-600" },
    ];

    return (
        <div className="bg-white">
            {/* ── Hero ── */}
            <PageHero 
                title={header.title}
                subtitle={header.subtitle}
                badgeText="Contact"
                badgeIcon={Phone}
            />

            {/* ── Contact Grid ── */}
            <section className="py-14 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                        {/* Left: Contact Info */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Corporate Office</h2>
                                <p className="text-gray-500 text-sm">Reach out through any of these channels — we&apos;d love to hear from you.</p>
                            </div>
                            {contactItems.map((item, i) => (
                                <div key={i} className="flex items-start gap-5 p-5 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all bg-white">
                                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                                        <item.icon size={22} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">{item.label}</p>
                                        {item.href ? (
                                            <a href={item.href} className="text-gray-800 font-semibold text-sm hover:text-primary transition-colors leading-relaxed block">{item.value}</a>
                                        ) : (
                                            <p className="text-gray-800 font-semibold text-sm leading-relaxed">{item.value}</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Map embed */}
                            {details.map_embed_url && (
                                <div id="map" className="rounded-2xl overflow-hidden border border-gray-200 h-56 mt-2">
                                    <iframe src={details.map_embed_url} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
                                </div>
                            )}
                        </div>

                        {/* Right: Contact Form */}
                        <div className="bg-gray-50 rounded-3xl p-8 lg:p-10 border border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Send Us a Message</h2>
                            <p className="text-gray-500 text-sm mb-8">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Branch Offices ── */}
            {details.branches && details.branches.length > 0 && (
                <section className="py-14 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Our Branch Offices</h2>
                            <p className="text-gray-500 text-sm">Visit us at any of our locations.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {details.branches.map((branch, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-primary/20 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 leading-tight">{branch.office_name}</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{branch.address}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

