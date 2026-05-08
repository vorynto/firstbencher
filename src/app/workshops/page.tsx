import React from "react";
import { createClient } from "@/lib/supabase";
import PageHero from "@/components/ui/PageHero";
import WorkshopCard from "@/components/workshops/WorkshopCard";

export const metadata = {
    title: "Upcoming Workshops | First Bencher",
    description: "Join our expert-led live workshops and enhance your skills in tech and management.",
};

export default async function WorkshopsPage() {
    const supabase = await createClient();

    // Fetch active workshops only
    const { data: workshops } = await supabase
        .from("events")
        .select("*")
        .eq("active", true)
        .order("event_date", { ascending: true });

    return (
        <main className="min-h-screen bg-background">
            <PageHero
                title="Upcoming Workshops"
                subtitle="Elevate your career with our intensive, hands-on live training sessions led by industry experts."
            />

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
                    {workshops && workshops.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
                            {workshops.map((workshop) => (
                                <WorkshopCard key={workshop.id} workshop={workshop} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-accent/20 rounded-[32px] border border-dashed border-border mt-8">
                            <h3 className="text-2xl font-bold text-foreground mb-2">No upcoming workshops</h3>
                            <p className="text-muted-foreground">Check back later for new scheduled events!</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
