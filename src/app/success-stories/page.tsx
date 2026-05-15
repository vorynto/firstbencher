import React from "react";
import Link from "next/link";
import { Star, MessageSquareQuote, ChevronRight, Award } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import PageHero from "@/components/ui/PageHero";

export const metadata = {
    title: "Success Stories | First Bencher",
    description: "Read inspiring success stories from our students who have accelerated their careers with First Bencher.",
};

export const revalidate = 60;

export default async function SuccessStoriesPage() {
    // Use server client — works for both logged-in and anonymous visitors
    const supabase = await createServerSupabaseClient();

    // Silently check if the visitor is logged in (for the CTA button only — page is public)
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch only approved stories — this is public data, anon key is fine
    const { data: stories } = await supabase
        .from("success_stories")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

    return (
        <>
            {/* Hero Section */}
            <PageHero
                title="Real People."
                highlightedTitle="Real Success."
                subtitle="Discover how our students have leveraged First Bencher's training programs to achieve their goals, secure promotions, and transition into rewarding new roles."
                badgeText="Over 10,000+ Careers Transformed"
                badgeIcon={Award}
            />

            {/* Stories Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
                {!stories || stories.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                        <MessageSquareQuote size={64} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">More stories coming soon!</h3>
                        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
                            We are constantly collecting amazing experiences from our students. Check back soon for inspiring testimonials.
                        </p>
                        {user ? (
                            <Link href="/feedback" className="bg-[#a60303] text-white px-8 py-3 rounded-full font-bold hover:bg-[#800202] transition-colors inline-block">
                                Submit Your Story
                            </Link>
                        ) : (
                            <Link href="/login?redirect=/feedback" className="bg-[#a60303] text-white px-8 py-3 rounded-full font-bold hover:bg-[#800202] transition-colors inline-block">
                                Sign In to Submit Your Story
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stories.map((story) => (
                            <div key={story.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col gap-5">

                                {/* Profile image + name / course / company */}
                                <div className="flex items-center gap-4">
                                    {story.image_url ? (
                                        <img
                                            src={story.image_url}
                                            alt={story.student_name}
                                            className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a60303] to-[#c60404] flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
                                            {story.student_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-black text-gray-900 text-lg leading-tight">{story.student_name}</h4>
                                        {story.course_name && <p className="text-sm font-semibold text-[#a60303] mt-0.5">{story.course_name}</p>}
                                        {story.company_name && <p className="text-sm text-gray-500">{story.company_name}</p>}
                                    </div>
                                </div>

                                {/* Star rating */}
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} className={i < (story.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                                    ))}
                                </div>

                                {/* Review message */}
                                <div className="border-l-4 border-[#a60303]/20 pl-4">
                                    <p className="text-gray-700 leading-relaxed">&ldquo;{story.message}&rdquo;</p>
                                </div>

                                {/* Certificate */}
                                {story.certificate_url && (
                                    <div className="pt-1">
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                                            <Award size={13} className="text-[#a60303]" /> Course Certificate
                                        </p>
                                        <a
                                            href={story.certificate_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                                        >
                                            <img
                                                src={story.certificate_url}
                                                alt={`${story.student_name}'s certificate`}
                                                className="w-full h-auto object-contain bg-gray-50"
                                            />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-20 bg-red-50 rounded-3xl p-10 lg:p-14 text-center border border-red-100">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Have your own success story?</h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
                        Did our courses help you clear a certification or land a new job? We&apos;d love to hear from you and feature you on our wall of fame!
                    </p>
                    {user ? (
                        <Link
                            href="/feedback"
                            className="bg-[#1a1a1a] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#a60303] transition-colors shadow-xl shadow-red-900/10 inline-flex items-center gap-2 group"
                        >
                            Share Your Experience <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ) : (
                        <Link
                            href="/login?redirect=/feedback"
                            className="bg-[#1a1a1a] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#a60303] transition-colors shadow-xl shadow-red-900/10 inline-flex items-center gap-2 group"
                        >
                            Sign In to Share Your Story <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
