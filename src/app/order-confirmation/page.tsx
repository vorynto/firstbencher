import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatPrice } from "@/lib/countries";

function currencySymbol(code: string) {
    return code === "INR" ? "₹" : code === "USD" ? "$" : code === "EUR" ? "€" : code === "GBP" ? "£" : code + " ";
}

function maskEmail(email: string) {
    const [name, domain] = email.split("@");
    if (!domain) return email;
    const visible = name.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

export default async function OrderConfirmationPage({
    searchParams,
}: {
    searchParams: Promise<{ order?: string; status?: string }>;
}) {
    const { order: orderRef, status: statusParam } = await searchParams;

    const { data: order } = orderRef
        ? await supabaseAdmin
            .from("orders")
            .select("course_title, amount, currency_code, status, guest_email, user_id")
            .eq("order_ref", orderRef)
            .maybeSingle()
        : { data: null };

    const status = order?.status || statusParam || "error";

    const meta =
        status === "success"
            ? { icon: CheckCircle2, cls: "bg-green-50 text-green-600", title: "Payment Successful!" }
            : status === "failed"
                ? { icon: XCircle, cls: "bg-red-50 text-red-600", title: "Payment Failed" }
                : status === "cancelled"
                    ? { icon: AlertTriangle, cls: "bg-gray-100 text-gray-500", title: "Payment Cancelled" }
                    : { icon: AlertTriangle, cls: "bg-red-50 text-red-600", title: "Something Went Wrong" };

    return (
        <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-8 sm:p-10 text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${meta.cls}`}>
                    <meta.icon size={40} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">{meta.title}</h1>

                {order ? (
                    <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Course</span>
                            <span className="font-bold text-gray-900 text-right">{order.course_title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Amount</span>
                            <span className="font-bold text-gray-900">{formatPrice(order.amount, currencySymbol(order.currency_code))}</span>
                        </div>
                        {orderRef && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Order Ref</span>
                                <span className="font-mono text-xs text-gray-600">{orderRef}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 mb-6">We couldn&apos;t find details for this order.</p>
                )}

                {status === "success" && (
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {order?.guest_email
                            ? <>We&apos;ve created a student account for <strong>{maskEmail(order.guest_email)}</strong>. Check your inbox for an email to set your password and access your course in the Student Portal.</>
                            : <>Your course is now available in your Student Portal.</>}
                    </p>
                )}
                {status === "failed" && (
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        No amount was charged. You can try the payment again from the course page.
                    </p>
                )}
                {status === "cancelled" && (
                    <p className="text-gray-600 mb-8 leading-relaxed">You cancelled the payment before it completed.</p>
                )}
                {status === "error" && (
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        If you were charged, please contact support with your order reference above.
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href={status === "success" ? "/login" : "/courses"}
                        className="inline-flex items-center justify-center gap-2 bg-[var(--primary)] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
                    >
                        {status === "success" ? "Log In to Your Portal" : "Browse Courses"} <ArrowRight size={15} />
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
