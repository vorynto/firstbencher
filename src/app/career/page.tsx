import React from "react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import PageHero from "@/components/ui/PageHero";
import CareerClient from "@/components/career/CareerClient";
import { Users, Rocket, Heart } from "lucide-react";

export const metadata = {
    title: "Careers | First Bencher",
    description: "Join the First Bencher team. Explore open positions and be part of a mission-driven education company.",
};

const PERKS = [
    { icon: Rocket, title: "Grow Fast", desc: "Work on cutting-edge ed-tech products and level up your skills every day." },
    { icon: Users, title: "Great Team", desc: "Collaborate with passionate educators, developers, and designers." },
    { icon: Heart, title: "Mission Driven", desc: "Help thousands of professionals upskill and transform their careers." },
];

export default async function CareerPage() {
    const supabase = await createServerSupabaseClient();
    const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

    return (
        <main className="min-h-screen bg-background">
            <PageHero
                title="Join Our Team"
                subtitle="Be part of a team that's shaping the future of professional education."
            />

            {/* Job listings */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <CareerClient jobs={jobs || []} />
                </div>
            </section>

            {/* Why join us */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {PERKS.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex gap-4 items-start">
                                <div className="w-11 h-11 rounded-2xl bg-[var(--primary)]/8 flex items-center justify-center shrink-0">
                                    <Icon size={20} className="text-[var(--primary)]" />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 mb-1">{title}</p>
                                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
