import React from "react";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { Calendar, User, ArrowLeft, Clock, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import PageHero from "@/components/ui/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { sanitize } from "@/lib/sanitize";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

// Server-only admin client for generateStaticParams / generateMetadata
const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ISR: revalidate once a day
export const revalidate = 86400;

export async function generateStaticParams() {
    const { data } = await supabaseAdmin.from("blogs").select("slug");
    return (data || []).map(b => ({ slug: b.slug }));
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const { data: blog } = await supabaseAdmin
        .from("blogs")
        .select("id, title, excerpt, image_url")
        .eq("slug", slug)
        .single();

    if (!blog) return { title: "Blog Post | First Bencher" };

    // Check for admin-set SEO data
    const { data: seoRow } = await supabaseAdmin
        .from("pages_content")
        .select("content")
        .eq("page_name", `seo:blog:${blog.id}`)
        .maybeSingle();
    const seo = seoRow?.content as { seoTitle?: string; metaDescription?: string } | null;

    const title = seo?.seoTitle || blog.title;
    const description = seo?.metaDescription || blog.excerpt || `Read ${blog.title} on First Bencher.`;
    const url = `${SITE_URL}/blog/${slug}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            type: "article",
            url,
            title,
            description,
            images: blog.image_url
                ? [{ url: blog.image_url, width: 1200, height: 630, alt: blog.title }]
                : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: blog.image_url ? [blog.image_url] : [],
        },
    };
}

export default async function BlogDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch the blog post
    const { data: blog } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!blog) {
        notFound();
    }

    // Fetch recent posts for sidebar
    const { data: recentPosts } = await supabase
        .from("blogs")
        .select("title, slug, published_at, image_url")
        .neq("slug", slug)
        .order("published_at", { ascending: false })
        .limit(4);

    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: blog.title,
        description: blog.excerpt || "",
        url: `${SITE_URL}/blog/${slug}`,
        ...(blog.image_url && { image: blog.image_url }),
        datePublished: blog.published_at,
        dateModified: blog.published_at,
        author: {
            "@type": "Person",
            name: blog.author || "First Bencher Staff",
        },
        publisher: {
            "@type": "Organization",
            name: "First Bencher",
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL}/blog/${slug}`,
        },
    };

    return (
        <>
        <JsonLd data={articleJsonLd} />
        <main className="min-h-screen bg-white pb-24">
            {/* Post Header */}
            <PageHero>
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-4xl text-center md:text-left">
                        <Link 
                            href="/blog" 
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[var(--primary)] transition-colors mb-10 group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Knowledge Hub
                        </Link>
                        
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-tint text-[var(--primary)] text-[10px] font-black uppercase tracking-widest mb-6 border border-red-100/50 mx-auto md:mx-0">
                            Professional Insights
                        </div>
                        
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-8">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs font-black uppercase tracking-widest text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary-tint flex items-center justify-center text-[var(--primary)]">
                                    <User size={14} />
                                </div>
                                <span className="text-gray-900">{blog.author || "First Bencher Staff"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span>{new Date(blog.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-gray-400" />
                                <span>6 min read</span>
                            </div>
                        </div>
                    </div>
                </div>
            </PageHero>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Main Content */}
                    <article className="lg:flex-1">
                        {blog.image_url && (
                            <div className="relative h-[400px] md:h-[500px] rounded-[48px] overflow-hidden mb-12 shadow-2xl shadow-gray-200/50">
                                <Image
                                    src={blog.image_url}
                                    alt={blog.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div 
                            className="prose prose-lg prose-red max-w-none 
                            prose-headings:font-black prose-headings:text-gray-900 
                            prose-p:text-gray-600 prose-p:leading-relaxed
                            prose-strong:text-gray-900 prose-strong:font-bold
                            prose-img:rounded-3xl prose-img:shadow-xl"
                            dangerouslySetInnerHTML={{ __html: sanitize(blog.content || "") }}
                        />

                        {/* Footer / Share */}
                        <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Share this insight:</span>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map((i) => (
                                        <button key={i} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
                                            <Share2 size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button variant="outline" className="rounded-full px-8">
                                Subscribe to Newsletter
                            </Button>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:w-80 shrink-0">
                        <div className="sticky top-32 space-y-12">
                            {/* Recent Posts Widget */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <span className="w-8 h-px bg-red-600" />
                                    Recent Insights
                                </h3>
                                <div className="space-y-8">
                                    {recentPosts?.map((post) => (
                                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col gap-3">
                                            <div className="relative h-24 rounded-2xl overflow-hidden bg-gray-100">
                                                {post.image_url && (
                                                    <Image
                                                        src={post.image_url}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
                                                    {post.title}
                                                </h4>
                                                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                                                    {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Widget */}
                            <div className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/20 rounded-full blur-2xl" />
                                <h3 className="text-xl font-black mb-4 relative z-10">Accelerate Your Career</h3>
                                <p className="text-gray-400 text-xs font-medium leading-relaxed mb-6 relative z-10">
                                    Get industry-certified training and join 10,000+ professionals globally.
                                </p>
                                <Button className="w-full text-xs py-3.5">
                                    Explore Courses
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
        </>
    );
}
