import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowRight } from "lucide-react";
import WorkshopCard from "@/components/workshops/WorkshopCard";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function UpcomingWorkshops() {
    // Fetch only the top 3 upcoming active workshops
    const { data: workshops } = await supabase
        .from("events")
        .select("*")
        .eq("active", true)
        .order("event_date", { ascending: true })
        .limit(3);

    if (!workshops || workshops.length === 0) return null;

    return (
        <section className="pt-24 pb-10 px-8 bg-accent/10 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wider uppercase mb-6">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Live Sessions
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">
                            Upcoming <span className="text-primary">Workshops</span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Join our expert instructors for live, interactive sessions designed to rapidly accelerate your skillset and career.
                        </p>
                    </div>
                    
                    <Link href="/workshops" className="hidden md:inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group shrink-0">
                        View All Workshops
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {workshops.map((workshop) => (
                        <WorkshopCard key={workshop.id} workshop={workshop} />
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link href="/workshops" className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-bold w-full active:scale-95 transition-all">
                        View All Workshops
                    </Link>
                </div>
            </div>
        </section>
    );
}
