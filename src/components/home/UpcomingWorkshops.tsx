import React from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Calendar, MapPin, ArrowRight, Image as ImageIcon } from "lucide-react";

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
        <section className="py-24 px-8 bg-accent/10 relative overflow-hidden">
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
                        <div key={workshop.id} className="group bg-background rounded-[32px] border border-border/50 hover:border-primary/50 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1">
                            <div className="relative h-60 w-full overflow-hidden bg-accent/20">
                                {workshop.image_url ? (
                                    <Image 
                                        src={workshop.image_url} 
                                        alt={workshop.title} 
                                        fill 
                                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground/30">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                                
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    {workshop.category && (
                                        <span className="bg-primary/90 backdrop-blur-sm text-white text-xs font-black uppercase px-3 py-1.5 rounded-lg">
                                            {workshop.category}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 text-sm font-semibold text-primary mb-4">
                                    <Calendar size={18} />
                                    <span>{new Date(workshop.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                
                                <h3 className="text-2xl font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">
                                    {workshop.title}
                                </h3>
                                
                                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-8">
                                    <MapPin size={16} className="shrink-0" />
                                    <span className="truncate">{workshop.location}</span>
                                </div>

                                <div className="mt-auto pt-6 border-t border-border">
                                    <Link href={`/contact?subject=Register%20for%20workshop:%20${encodeURIComponent(workshop.title)}`} className="text-foreground font-bold hover:text-primary transition-colors flex items-center justify-between w-full group/link">
                                        <span>Register Interest</span>
                                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center group-hover/link:bg-primary group-hover/link:text-white transition-colors">
                                            <ArrowRight size={18} className="group-hover/link:-rotate-45 transition-transform" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
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
