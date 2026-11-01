import Link from "next/link";
import { ArrowRight, BookOpen, Calendar } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function MyCoursesPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: orders } = await supabaseAdmin
        .from("orders")
        .select("course_id, course_title, created_at")
        .eq("user_id", user!.id)
        .eq("status", "success")
        .order("created_at", { ascending: false });

    const uniqueCourseIds = Array.from(new Set((orders || []).map(o => o.course_id)));
    const purchaseDateByCourse = new Map<string, string>();
    for (const o of orders || []) {
        if (!purchaseDateByCourse.has(o.course_id)) purchaseDateByCourse.set(o.course_id, o.created_at);
    }

    const { data: courses } = uniqueCourseIds.length
        ? await supabaseAdmin
            .from("courses")
            .select("id, title, slug, image_url, category, duration")
            .in("id", uniqueCourseIds)
        : { data: [] };

    const myCourses = (courses || []).sort(
        (a, b) =>
            new Date(purchaseDateByCourse.get(b.id) || 0).getTime() -
            new Date(purchaseDateByCourse.get(a.id) || 0).getTime()
    );

    const purchasedOnLabel = new Map<string, string>();
    for (const course of myCourses) {
        purchasedOnLabel.set(
            course.id,
            new Date(purchaseDateByCourse.get(course.id) || 0).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">My Courses</h1>
                <p className="text-gray-500 mt-1 font-medium">Courses you&apos;ve purchased and can access right now.</p>
            </div>

            {myCourses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-16 text-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={26} className="text-[var(--primary)]/50" />
                    </div>
                    <h3 className="font-black text-gray-900 mb-2">No courses yet</h3>
                    <p className="text-gray-500 mb-6 px-4">Browse our catalog and enroll in your first course.</p>
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 bg-[var(--primary)] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
                    >
                        Browse Courses <ArrowRight size={15} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.map(course => (
                        <Link
                            key={course.id}
                            href={`/courses/${course.slug}`}
                            className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col"
                        >
                            <div className="h-36 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] relative overflow-hidden">
                                {course.image_url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={course.image_url}
                                        alt={course.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay group-hover:scale-110 transition-transform duration-500"
                                    />
                                )}
                                {course.category && (
                                    <span className="absolute top-3 left-3 bg-white/90 text-[var(--primary)] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                                        {course.category}
                                    </span>
                                )}
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-black text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-[var(--primary)] transition-colors">
                                    {course.title}
                                </h3>
                                <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-400 font-semibold">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={13} />
                                        {purchasedOnLabel.get(course.id)}
                                    </span>
                                    <span className="text-[var(--primary)] font-bold flex items-center gap-1 group-hover:gap-1.5 transition-all">
                                        Open <ArrowRight size={13} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
