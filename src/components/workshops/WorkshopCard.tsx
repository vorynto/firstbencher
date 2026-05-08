"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useEnquiry } from "@/components/EnquiryModal";
import { generateSlug } from "@/lib/utils";

type Workshop = {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    category: string;
    image_url: string;
    active: boolean;
    link_type?: string | null;
    link_slug?: string | null;
};

export default function WorkshopCard({ workshop }: { workshop: Workshop }) {
    const { openEnquiry } = useEnquiry();

    const knowMoreHref =
        workshop.link_type === "course" && workshop.link_slug
            ? `/courses/${workshop.link_slug}`
            : `/workshops/${generateSlug(workshop.title)}`;

    return (
        <div className="group relative bg-white rounded-4xl border border-border/50 hover:border-primary/50 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col">
            {/* Image */}
            <div className="relative h-56 w-full bg-accent/20 overflow-hidden">
                {workshop.image_url ? (
                    <Image
                        src={workshop.image_url}
                        alt={workshop.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        <ImageIcon size={48} className="text-muted-foreground/30" />
                    </div>
                )}
                {workshop.category && (
                    <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full">
                        {workshop.category}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-4">
                    <Calendar size={16} />
                    <span>
                        {new Date(workshop.event_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                </div>

                <h3 className="text-2xl font-bold text-black mb-3 leading-tight group-hover:text-primary transition-colors">
                    {workshop.title}
                </h3>

                <div
                    className="text-gray-600 line-clamp-3 mb-6 flex-1 text-sm font-medium"
                    dangerouslySetInnerHTML={{
                        __html: workshop.description.replace(/<[^>]+>/g, " "),
                    }}
                />

                <div className="flex items-center gap-3 text-sm font-semibold text-gray-500 mb-6 p-4 bg-gray-50 rounded-2xl">
                    <MapPin size={18} className="text-primary shrink-0" />
                    <span className="truncate">{workshop.location}</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <Link
                        href={knowMoreHref}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white hover:bg-primary px-5 py-3 rounded-xl font-bold text-sm transition-all group/btn"
                    >
                        Know More
                        <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                    <button
                        onClick={() => openEnquiry(`Enroll Now — ${workshop.title}`)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 px-5 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                        Enroll Now
                    </button>
                </div>
            </div>
        </div>
    );
}
