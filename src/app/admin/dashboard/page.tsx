import React from "react";
import { GraduationCap, FileText, Mail, TrendingUp, Calendar, Briefcase } from "lucide-react";

const stats = [
    { label: "Total Courses", value: "45", icon: GraduationCap, trend: "+3 this month", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Web Pages", value: "15", icon: FileText, trend: "All active", color: "text-purple-500", bg: "bg-purple-50" },
    { label: "New Inquiries", value: "128", icon: Mail, trend: "+24 today", color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Site Visitors", value: "1.2k", icon: TrendingUp, trend: "+12% increase", color: "text-green-500", bg: "bg-green-50" },
];

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-black text-foreground mb-2">Welcome Back, Admin</h1>
                <p className="text-muted-foreground">Here&apos;s a summary of what&apos;s happening today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-background p-6 rounded-[24px] border border-border hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-4xl font-black text-foreground mb-1">{stat.value}</h3>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-tight">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-background p-8 rounded-[30px] border border-border min-h-[400px]">
                    <h3 className="text-xl font-bold mb-6">Recent Inquiries</h3>
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-transparent hover:border-border transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">JD</div>
                                    <div>
                                        <p className="font-bold text-sm">John Doe</p>
                                        <p className="text-xs text-muted-foreground">Inquiry about PMP Certification</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">2h ago</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-background p-8 rounded-[30px] border border-border min-h-[400px]">
                    <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3">
                            <GraduationCap className="text-primary" />
                            <span className="text-sm font-bold">Add Course</span>
                        </button>
                        <button className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3">
                            <FileText className="text-primary" />
                            <span className="text-sm font-bold">New Blog Post</span>
                        </button>
                        <button className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3">
                            <Calendar className="text-primary" />
                            <span className="text-sm font-bold">Schedule Event</span>
                        </button>
                        <button className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3">
                            <Briefcase className="text-primary" />
                            <span className="text-sm font-bold">Post Job</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
