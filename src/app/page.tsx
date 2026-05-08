import type { Metadata } from "next";
import HeroSection from "@/components/home/Hero";
import PopularCourses from "@/components/home/PopularCourses";
import AboutSection from "@/components/home/AboutSection";
import StatsCTA from "@/components/home/StatsCTA";
import SuccessStoriesSlider from "@/components/home/SuccessStoriesSlider";
import BlogSection from "@/components/home/BlogSection";
import UpcomingWorkshops from "@/components/home/UpcomingWorkshops";
import { createClient } from "@/lib/supabase";
import { JsonLd } from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://firstbencher.com";

export const metadata: Metadata = {
    title: "First Bencher | Expert Training in Project Management, AI & Technology",
    description:
        "Join 10,000+ certified professionals. Industry-recognized training in PMP, PRINCE2, AI, Machine Learning, Agile, and more. Enroll today.",
    alternates: { canonical: SITE_URL },
    openGraph: {
        url: SITE_URL,
        title: "First Bencher | Expert Training in Project Management, AI & Technology",
        description:
            "Industry-recognized training in PMP, AI, Machine Learning, Agile, and more. Join 10,000+ certified professionals.",
    },
};

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch Success Stories
  const { data: stories } = await supabase
    .from("success_stories")
    .select("id, student_name, course_name, company_name, rating, message, image_url")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(6);

  // Fetch Recent Blogs
  const { data: blogs } = await supabase
    .from("blogs")
    .select("id, title, slug, excerpt, author, image_url, published_at")
    .order("published_at", { ascending: false })
    .limit(3);

  const educationalOrgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "First Bencher",
    url: SITE_URL,
    description:
      "Expert training and consulting in Project Management, AI, Machine Learning, and technology certifications.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Professional Training Courses",
    },
  };

  return (
    <>
      <JsonLd data={educationalOrgJsonLd} />
      <div>
        <HeroSection />
        <PopularCourses />
        <UpcomingWorkshops />
        <AboutSection />
        <StatsCTA />
        <SuccessStoriesSlider stories={stories || []} />
        <BlogSection blogs={blogs || []} />
      </div>
    </>
  );
}
