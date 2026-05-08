import { createServerSupabaseClient } from "@/lib/supabase-server";
import { sanitize } from "@/lib/sanitize";
import PageHero from "@/components/ui/PageHero";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Award } from "lucide-react";
import { Metadata } from "next";

type CustomSection = {
    id: string;
    layout: "1-col" | "2-col";
    columns: Array<{
        type: "text" | "image";
        content?: string; // Rich text HTML
        image_url?: string;
    }>;
};

type CustomPageContent = {
    hero?: {
        title?: string;
        highlightedTitle?: string;
        subtitle?: string;
        badgeText?: string;
    };
    sections?: CustomSection[];
};

async function getCustomPage(slug: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase
            .from("pages_content")
            .select("content")
            .eq("page_name", `custom_page:${slug}`)
            .single();
        
        return data?.content as CustomPageContent | null;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const content = await getCustomPage(slug);
    
    return {
        title: content?.hero?.title || "Page Details",
        description: content?.hero?.subtitle || "Learn more on First Bencher.",
    };
}

export default async function DynamicCustomPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const content = await getCustomPage(slug);

    if (!content) {
        notFound();
    }

    const hero = content.hero || {};
    const sections = content.sections || [];

    return (
        <main className="bg-white min-h-screen">
            {/* ── Dynamic Hero ── */}
            <PageHero
                title={hero.title || "Custom Page"}
                highlightedTitle={hero.highlightedTitle}
                subtitle={hero.subtitle}
                badgeText={hero.badgeText}
                badgeIcon={Award}
            />

            {/* ── Dynamic Sections ── */}
            <div className="flex flex-col">
                {sections.map((section, idx) => (
                    <section 
                        key={section.id || idx} 
                        className={`py-16 md:py-24 ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <div className={`grid grid-cols-1 gap-12 lg:gap-20 items-center ${
                                section.layout === "2-col" ? "md:grid-cols-2" : "max-w-4xl mx-auto"
                            }`}>
                                {section.columns.map((col, cIdx) => (
                                    <div key={cIdx} className="w-full min-w-0">
                                        {col.type === "text" ? (
                                            <div className="w-full max-w-full overflow-hidden">
                                                <div 
                                                    className="prose prose-lg prose-gray max-w-full w-full text-left 
                                                    [overflow-wrap:break-word] [word-break:normal]
                                                    [&_h2]:text-3xl [&_h2]:font-black [&_h2]:text-gray-900 [&_h2]:mb-6
                                                    [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:mb-4
                                                    [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-6
                                                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6
                                                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-6
                                                    [&_li]:mb-2
                                                    [&_a]:text-[#a60303] [&_a]:font-bold [&_a]:underline
                                                    "
                                                    dangerouslySetInnerHTML={{
                                                        __html: sanitize((col.content || "").replace(/&nbsp;/g, ' '))
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full relative rounded-[32px] overflow-hidden shadow-2xl group transition-transform duration-500 hover:scale-[1.02]">
                                                {col.image_url ? (
                                                    <Image 
                                                        src={col.image_url} 
                                                        alt="Page content"
                                                        width={1200}
                                                        height={800}
                                                        className="w-full h-auto object-cover"
                                                    />
                                                ) : (
                                                    <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400">
                                                        No image selected
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
}
