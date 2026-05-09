import { createServerSupabaseClient } from "@/lib/supabase-server";
import Image from "next/image";
import Link from "next/link";
import { Award, Linkedin, ExternalLink, Users } from "lucide-react";

type AboutIntro = { title: string; subtitle: string; description: string; image_url: string; founded_year: string; students_count: string; courses_count: string; countries_count: string; };
type AboutVision = { headline: string; vision_title: string; vision_text: string; mission_title: string; mission_text: string; };
type ValueItem = { emoji: string; title: string; body: string; };
type AboutValues = { values: ValueItem[] };
type TeamMember = { name: string; role: string; image_url: string; bio: string; };
type AboutTeam = { headline: string; members: TeamMember[] };

const defaultIntro: AboutIntro = {
    title: "About First Bencher",
    subtitle: "We are a global leader in providing training and consulting solutions.",
    description: "First Bencher is dedicated to empowering professionals worldwide with cutting-edge skills in Project Management, Quality Management, AI & Machine Learning, and more.",
    image_url: "",
    founded_year: "2015",
    students_count: "10,000+",
    courses_count: "405+",
    countries_count: "50+",
};
const defaultVision: AboutVision = {
    headline: "Our Vision & Mission",
    vision_title: "Vision",
    vision_text: "To be the most trusted global platform for professional development and career transformation.",
    mission_title: "Mission",
    mission_text: "To deliver world-class, affordable, and flexible training that empowers individuals and organizations to reach their full potential.",
};
const defaultValues: AboutValues = {
    values: [
        { emoji: "🎯", title: "Excellence", body: "We pursue excellence in everything we do." },
        { emoji: "🤝", title: "Integrity", body: "We operate with transparency and ethical standards." },
        { emoji: "💡", title: "Innovation", body: "We continuously evolve our curriculum to reflect the latest trends." },
        { emoji: "🌍", title: "Inclusivity", body: "We believe quality education should be accessible to everyone." },
        { emoji: "📈", title: "Impact", body: "We measure success by the real-world impact on our learners' careers." },
        { emoji: "❤️", title: "Care", body: "We genuinely care about every learner's journey." },
    ],
};
const defaultTeam: AboutTeam = {
    headline: "Meet Our Leadership",
    members: [
        { name: "John Carter", role: "CEO & Founder", image_url: "https://i.pravatar.cc/150?u=team1", bio: "20+ years in organizational learning and development." },
        { name: "Sarah Mitchell", role: "Head of Training", image_url: "https://i.pravatar.cc/150?u=team2", bio: "PMP & PRINCE2 certified trainer with global experience." },
        { name: "David Lee", role: "Chief Technology Officer", image_url: "https://i.pravatar.cc/150?u=team3", bio: "Leading our digital learning platform and innovation." },
        { name: "Priya Sharma", role: "Head of Partnerships", image_url: "https://i.pravatar.cc/150?u=team4", bio: "Building strategic alliances across 50+ countries." },
    ],
};

import PageHero from "@/components/ui/PageHero";
import { sanitize } from "@/lib/sanitize";

async function fetchSection<T>(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, key: string, defaults: T): Promise<T> {
    try {
        const { data } = await supabase.from("pages_content").select("content").eq("page_name", key).single();
        if (data?.content) return { ...defaults, ...(data.content as Partial<T>) };
    } catch { /* ignore */ }
    return defaults;
}

export default async function AboutPage() {
    const supabase = await createServerSupabaseClient();
    
    // Fetch sections - using about_intro for its own content as requested
    const [intro, vision, valuesData, team] = await Promise.all([
        fetchSection<any>(supabase, "about_intro", defaultIntro),
        fetchSection<AboutVision>(supabase, "about_vision", defaultVision),
        fetchSection<AboutValues>(supabase, "about_values", defaultValues),
        fetchSection<AboutTeam>(supabase, "about_team", defaultTeam),
    ]);

    const ha = intro; // Map intro to the layout variable 'ha'

    return (
        <div className="bg-white">
            {/* ── Hero ── */}
            <PageHero 
                title="Pioneering Excellence in"
                highlightedTitle="Professional Training"
                subtitle="We are a global leader in providing training and consulting solutions, empowering professionals to reach their full potential."
                badgeText="About First Bencher"
                badgeIcon={Award}
            />

            {/* ── About Section (Matched to Home) ── */}
            <section className="py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        
                        {/* LEFT: IMAGE COMPOSITE — hidden on mobile, shown on sm+ */}
                        <div className="flex-1 relative hidden sm:block">
                            {/* Dot Pattern Decoration */}
                            <div className="absolute -left-12 -top-12 w-48 h-48 opacity-10 pointer-events-none hidden lg:block">
                                <div className="grid grid-cols-6 gap-4">
                                    {[...Array(36)].map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#a60303]" />
                                    ))}
                                </div>
                            </div>

                            <div className="relative z-10 flex gap-4 lg:gap-6 justify-center lg:justify-start">
                                {/* Image 1 — only shown on lg+ */}
                                <div className="mt-8 lg:mt-12 hidden lg:block">
                                    <div className="relative rounded-[32px] overflow-hidden border-8 border-white shadow-2xl w-[240px] h-[320px] lg:w-[300px] lg:h-[400px]">
                                        <Image
                                            src={ha.image1_url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"}
                                            alt="Learning"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Image 2 */}
                                <div className="relative">
                                    <div className="rounded-[32px] overflow-hidden border-8 border-white shadow-2xl w-[240px] h-[320px] sm:w-[280px] sm:h-[360px] lg:w-[300px] lg:h-[400px]">
                                        <Image
                                            src={ha.image2_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"}
                                            alt="Students"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Experience Badge — lg only */}
                                    <div className="hidden lg:flex absolute -top-10 -right-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-50 items-center gap-4 animate-bounce-slow z-20">
                                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                            <Award className="text-[#a60303]" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900 leading-none">{ha.exp_years || "10+"}</p>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{ha.exp_label || "Years Exp"}</p>
                                        </div>
                                    </div>

                                    {/* Awards Badge — lg only */}
                                    <div className="hidden lg:flex absolute -bottom-8 -left-16 bg-white p-5 rounded-2xl shadow-xl border border-gray-50 flex-col items-center text-center min-w-[140px] z-20">
                                        <p className="text-3xl font-black text-[#a60303] leading-none">{ha.awards_count || "25+"}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{ha.awards_label || "Awards"}</p>
                                        <div className="mt-2 flex -space-x-2">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold">👤</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: TEXT CONTENT */}
                        <div className="flex-1">
                            <h2 className="text-3xl sm:text-4xl lg:text-[52px] font-black text-gray-900 leading-[1.1] mb-6 lg:mb-8 max-w-2xl">
                                {ha.title ? (
                                    ha.title.includes("Innovation") ? (
                                        <>
                                            {ha.title.split("Innovation")[0]}
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a60303] to-[#F07C5A] italic">
                                                Innovation
                                            </span>
                                            {ha.title.split("Innovation")[1]}
                                        </>
                                    ) : ha.title
                                ) : (
                                    <>Our Story: Built On Values, Driven By <span className="text-[#a60303] italic text-[#a60303]">Innovation</span></>
                                )}
                            </h2>

                            <div 
                                className="text-gray-500 text-lg leading-relaxed mb-10 max-w-2xl prose prose-gray"
                                dangerouslySetInnerHTML={{ __html: sanitize((ha.description || ha.subtitle).replaceAll("&nbsp;", " ")) }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Mission & Vision Section (New) ── */}
            <section className="py-24 bg-red-50/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-[#a60303] text-[10px] font-black uppercase tracking-widest mb-4 border border-red-100/50">
                            <Award size={14} /> Our Core Purpose
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                            {vision.headline || "Mission & Vision"}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Mission */}
                        <div className="bg-white p-10 lg:p-12 rounded-[40px] shadow-xl shadow-red-900/5 border border-red-50 group hover:-translate-y-2 transition-all duration-500">
                            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-8 group-hover:scale-110 transition-transform">
                                <Award size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-6">
                                {vision.mission_title || "Our Mission"}
                            </h3>
                            <div 
                                className="text-gray-500 leading-relaxed prose prose-gray prose-sm"
                                dangerouslySetInnerHTML={{ __html: sanitize(vision.mission_text) }}
                            />
                        </div>

                        {/* Vision */}
                        <div className="bg-white p-10 lg:p-12 rounded-[40px] shadow-xl shadow-red-900/5 border border-red-50 group hover:-translate-y-2 transition-all duration-500">
                            <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-500 mb-8 group-hover:scale-110 transition-transform">
                                <Award size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-6">
                                {vision.vision_title || "Our Vision"}
                            </h3>
                            <div 
                                className="text-gray-500 leading-relaxed prose prose-gray prose-sm"
                                dangerouslySetInnerHTML={{ __html: sanitize(vision.vision_text) }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Core Values ── */}
            {valuesData.values?.length > 0 && (
                <section className="py-14 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-14">
                            <span className="inline-block bg-[#a60303]/10 text-[#a60303] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-4">Our Values</span>
                            <h2 className="text-4xl font-black text-gray-900">What Drives Us</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {valuesData.values.map((val, i) => (
                                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-[#a60303]/20 group">
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{val.emoji}</div>
                                    <h3 className="text-lg font-black text-gray-900 mb-2">{val.title}</h3>
                                    <div className="text-gray-500 text-sm leading-relaxed prose prose-sm prose-gray" dangerouslySetInnerHTML={{ __html: sanitize(val.body) }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Team Section ── */}
            {team.members?.length > 0 && (
                <section className="py-32 bg-white relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-50/50 rounded-full blur-[100px] -z-10" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-50/30 rounded-full blur-[120px] -z-10" />
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-[#a60303] text-[10px] font-black uppercase tracking-widest mb-6 border border-red-100/50">
                                <Users size={14} /> Our Visionaries
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                {team.headline || "Meet Our Leadership"}
                            </h2>
                            <p className="text-gray-500 text-lg">Our team of experts is dedicated to your professional success and growth.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {team.members.map((member, i) => (
                                <div key={i} className="group relative">
                                    {/* Card Container */}
                                    <div className="relative bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:border-red-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(166,3,3,0.12)] transition-all duration-700 flex flex-col items-center text-center h-full hover:-translate-y-4">
                                        
                                        {/* Image Frame */}
                                        <div className="relative mb-8 pt-2">
                                            {/* Decorative Ring */}
                                            <div className="absolute inset-0 bg-red-600 rounded-[2.5rem] rotate-6 group-hover:rotate-12 group-hover:scale-105 transition-all duration-700" />
                                            
                                            <div className="relative w-40 h-40 rounded-[2.2rem] overflow-hidden bg-gray-100 border-4 border-white shadow-xl">
                                                {member.image_url ? (
                                                    <Image 
                                                        src={member.image_url} 
                                                        alt={member.name} 
                                                        fill
                                                        className="object-cover transition-all duration-700 group-hover:scale-110 filter group-hover:brightness-110" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-red-50 text-[#a60303]">👤</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Name & Role */}
                                        <div className="mb-4">
                                            <h3 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-[#a60303] transition-colors duration-500">
                                                {member.name}
                                            </h3>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a60303] bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                                {member.role}
                                            </span>
                                        </div>

                                        {/* Bio */}
                                        <div 
                                            className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-8 opacity-80 group-hover:opacity-100 transition-opacity prose prose-sm prose-gray italic"
                                            dangerouslySetInnerHTML={{ __html: sanitize(member.bio) }}
                                        />

                                        {/* Social Link (Placeholder for now as DB doesn't have it, but adds to the look) */}
                                        <div className="mt-auto flex gap-3">
                                            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 hover:bg-[#a60303] hover:text-white hover:border-[#a60303] transition-all duration-300">
                                                <Linkedin size={18} />
                                            </button>
                                            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300">
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
