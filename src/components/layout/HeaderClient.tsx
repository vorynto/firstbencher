"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Search, Menu, X, ShoppingCart, User,
    ChevronDown, LayoutGrid, Star, Clock,
    Mail, Phone, MapPin
} from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type NavCategory = { name: string; emoji: string; count: number };

type TopBarContent = {
    email: string;
    phone: string;
    address: string;
    logo_header?: string;
    nav_links?: Array<{ name: string; href: string; hasDropdown: boolean; subLinks?: Array<{ name: string; href: string }> }>;
    nav_categories?: NavCategory[];
    show_search?: boolean;
    show_cart?: boolean;
    auth_buttons_active?: boolean;
    login_text?: string;
    login_href?: string;
    register_text?: string;
    register_href?: string;
};

function slugify(str: string) {
    return str
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

const DEFAULT_CATEGORIES: NavCategory[] = [
    { name: "Project Management", count: 12, emoji: "📋" },
    { name: "Program Management", count: 8, emoji: "🗂️" },
    { name: "Quality Management", count: 10, emoji: "✅" },
    { name: "Business Analysis", count: 9, emoji: "📊" },
    { name: "AI & Machine Learning", count: 14, emoji: "🤖" },
    { name: "Supply Chain", count: 7, emoji: "🔗" },
    { name: "IT Programming", count: 11, emoji: "💻" },
    { name: "Operations", count: 6, emoji: "⚙️" },
];

export default function HeaderClient({ topBar }: { topBar: TopBarContent }) {
    const [isOpen, setIsOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [openMobileSubMenu, setOpenMobileSubMenu] = useState<string | null>(null);
    const [catOpen, setCatOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const pathname = usePathname();

    // Search state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Show if scrolling up OR at the very top
            if (currentScrollY < lastScrollY || currentScrollY < 120) {
                setIsVisible(true);
            } 
            // Hide if scrolling down AND past the header area
            else if (currentScrollY > lastScrollY && currentScrollY > 120) {
                setIsVisible(false);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    React.useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/courses/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                setSearchResults(data.courses || []);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset states and scroll to top on navigation
    React.useEffect(() => {
        setIsVisible(true);
        setLastScrollY(0);
        setIsOpen(false);
        setOpenDropdown(null);
        setOpenMobileSubMenu(null);
        setCatOpen(false);
        // Add a tiny delay to ensure Next.js has completed the navigation
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);
        return () => clearTimeout(timer);
    }, [pathname]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
            setIsSearchOpen(false);
        }
    };

    const isFixed = lastScrollY > 42;

    // Use admin-configured categories if available, otherwise fall back to defaults
    const categories = (
        topBar.nav_categories && topBar.nav_categories.length > 0
            ? topBar.nav_categories
            : DEFAULT_CATEGORIES
    ).map(c => ({ ...c, href: `/courses?cat=${slugify(c.name)}` }));

    const defaultNav: NonNullable<TopBarContent["nav_links"]> = [
        { name: "Home", href: "/", hasDropdown: false },
        { name: "Courses", href: "/courses", hasDropdown: true },
        { name: "Success Stories", href: "/success-stories", hasDropdown: false },
        { name: "Contact", href: "/contact", hasDropdown: false },
    ];

    const navLinks = topBar.nav_links || defaultNav;

    return (
        <>
            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-2xl transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 overflow-y-auto h-full">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-12">
                                <h2 className="text-3xl font-black text-gray-900 italic">Search Our <span className="text-[var(--primary)]">Expertise</span></h2>
                                <button 
                                    onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                                    className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)]/20 transition-all bg-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSearchSubmit} className="relative mb-12 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" size={24} />
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Looking for a specific course or skill? (e.g. PMP, Agile, Cloud)" 
                                    className="w-full pl-16 pr-16 py-6 rounded-2xl border-2 border-gray-100 focus:border-[var(--primary)] outline-none text-xl font-bold text-gray-800 transition-all shadow-xl shadow-red-900/5"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {isSearching && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                        <div className="w-6 h-6 border-3 border-gray-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </form>

                            {/* Results */}
                            {searchQuery.length >= 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    {searchResults.length > 0 ? (
                                        searchResults.map((course: any) => (
                                            <Link 
                                                key={course.id}
                                                href={`/courses/${course.slug}`}
                                                className="flex items-center gap-5 p-4 rounded-2xl bg-white border border-gray-50 hover:border-[var(--primary)]/20 hover:shadow-xl hover:shadow-red-900/5 transition-all group"
                                                onClick={() => setIsSearchOpen(false)}
                                            >
                                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                                    {course.image_url ? (
                                                        <Image src={course.image_url} alt="" width={80} height={80} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-[#f8f9ff]"><LayoutGrid size={24} strokeWidth={1.5} /></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest bg-accent px-2 py-0.5 rounded-full border border-[var(--primary)]/20/50 inline-block">{course.category}</span>
                                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-[var(--primary)] transition-colors leading-tight mt-1 line-clamp-1">{course.title}</h4>
                                                    <p className="text-sm text-gray-400 mt-1 line-clamp-1 font-medium">{course.short_description || "Certified training program"}</p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : !isSearching && (
                                        <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                                            <p className="text-gray-400 font-bold">No results found for &quot;{searchQuery}&quot;</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {searchQuery.length > 0 && searchResults.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                                    <Link 
                                        href={`/courses?search=${encodeURIComponent(searchQuery)}`}
                                        className="inline-flex items-center gap-2 text-[var(--primary)] font-black uppercase tracking-widest text-sm hover:underline"
                                        onClick={() => setIsSearchOpen(false)}
                                    >
                                        View All Search Results <span className="text-lg leading-none">→</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <header className="relative z-50 w-full min-h-[118px]">
                {/* ── Top Bar ── */}
                <div className="bg-[var(--primary)] text-white/80 h-[42px]">
                    <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between h-full text-[13px] font-medium tracking-wide">
                        <div className="flex items-center gap-6">
                            <a href={`mailto:${topBar.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                                <Mail size={14} className="text-white/60 shrink-0" />
                                {topBar.email}
                            </a>
                            <span className="w-px h-4 bg-white/20 hidden sm:block" />
                            <a href={`tel:${topBar.phone}`} className="hidden sm:flex items-center gap-2 hover:text-white transition-colors">
                                <Phone size={14} className="text-white/60 shrink-0" />
                                {topBar.phone}
                            </a>
                        </div>
                        <div className="hidden md:flex items-center gap-2 hover:text-white transition-colors cursor-default">
                            <MapPin size={14} className="text-white/60 shrink-0" />
                            {topBar.address}
                        </div>
                    </div>
                </div>

                {/* ── Main Nav Row ── */}
                <div className={cn(
                    "bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm z-50 transition-all duration-300 ease-in-out h-[76px]",
                    isFixed ? "fixed top-0 left-0 right-0 w-full" : "relative",
                    isVisible || !isFixed ? "translate-y-0" : "-translate-y-full"
                )}>
                    <div className="container mx-auto px-6 lg:px-12 flex items-center h-full gap-6">

                        {/* Logo */}
                        <Link href="/" className="flex items-center shrink-0 mr-2 lg:mr-6">
                            {topBar.logo_header ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    suppressHydrationWarning
                                    src={topBar.logo_header}
                                    alt="First Bencher Logo"
                                    width={220}
                                    height={60}
                                    className="object-contain h-[60px] w-auto"
                                />
                            ) : (
                                <span className="text-[28px] font-bold tracking-tight text-gray-800 flex items-center">
                                    <span className="text-[var(--primary)]">Fi</span>
                                    <span>Study</span>
                                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] ml-0.5 mt-2"></span>
                                </span>
                            )}
                        </Link>

                        {/* Category Dropdown Button */}
                        <div
                            suppressHydrationWarning
                            className="relative hidden xl:block pb-2"
                            onMouseEnter={() => setCatOpen(true)}
                            onMouseLeave={() => setCatOpen(false)}
                        >
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--primary)]/20 bg-accent/30 text-[13px] font-semibold text-gray-700 hover:border-[var(--primary)]/30 transition-all">
                                <LayoutGrid size={15} className="text-[var(--primary)]" />
                                Category
                                <ChevronDown size={14} className={cn("transition-transform duration-200 text-[var(--primary)]", catOpen ? "rotate-180" : "")} />
                            </button>

                            {catOpen && (
                                <div className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[520px] z-50">
                                    <div className="grid grid-cols-2 gap-3">
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.href}
                                                href={cat.href}
                                                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                            >
                                                <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                                                    {cat.emoji}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug">{cat.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5 font-medium">{cat.count}+ Courses</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 flex-1 justify-center ml-2 xl:ml-0">
                            {navLinks.map((link) => (
                                <div
                                    key={link.href}
                                    className="relative py-4"
                                    onMouseEnter={() => link.hasDropdown && setOpenDropdown(link.name)}
                                    onMouseLeave={() => setOpenDropdown(null)}
                                >
                                    <Link
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-1 text-[14px] font-semibold transition-colors group relative",
                                            pathname === link.href ? "text-[var(--primary)]" : "text-[#1a202c] hover:text-[var(--primary)]"
                                        )}
                                    >
                                        {link.name}
                                        {link.hasDropdown && (
                                            <ChevronDown size={13} className={cn("transition-transform duration-200 opacity-60", openDropdown === link.name ? "rotate-180" : "")} />
                                        )}
                                        {pathname === link.href && (
                                            <span className="absolute -bottom-[27px] left-0 w-full h-[2px] bg-[var(--primary)] origin-left rounded-t" />
                                        )}
                                    </Link>

                                    {link.hasDropdown && openDropdown === link.name && (
                                        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[220px] z-50">
                                            {link.subLinks && link.subLinks.length > 0 ? (
                                                link.subLinks.map((sub, i) => (
                                                    <Link key={i} href={sub.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-[var(--primary)] font-medium transition-colors">
                                                        {sub.name}
                                                    </Link>
                                                ))
                                            ) : (
                                                <Link href={link.href === "/courses" ? "/courses" : link.href} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-[var(--primary)] font-medium transition-colors">
                                                    {link.href === "/courses" ? "All Courses" : `${link.name} Overview`}
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Right Actions */}
                        <div className="hidden lg:flex items-center gap-4 shrink-0">
                            {/* Search Trigger */}
                            {topBar.show_search !== false && (
                                <button 
                                    onClick={() => setIsSearchOpen(true)}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all shadow-sm"
                                >
                                    <Search size={18} />
                                </button>
                            )}
                            
                            {/* Shopping Cart Icon */}
                            {topBar.show_cart !== false && (
                                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all shadow-sm relative">
                                    <ShoppingCart size={18} />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F07C5A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
                                </button>
                            )}

                            {(topBar.show_search !== false || topBar.show_cart !== false) && topBar.auth_buttons_active !== false && (
                                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            )}

                            {/* Auth Buttons */}
                            {topBar.auth_buttons_active !== false && (
                                <>
                                    <Button 
                                        variant="ghost"
                                        href={topBar.login_href || "/login"} 
                                        className="text-sm font-bold text-gray-700 hover:text-[var(--primary)] px-4 py-2"
                                    >
                                        {topBar.login_text || "Login"}
                                    </Button>
                                    <Button 
                                        href={topBar.register_href || "/register"} 
                                        className="text-[13px] font-bold px-6 py-2.5 rounded shadow-md"
                                    >
                                        {topBar.register_text || "Register"}
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Search and Toggle */}
                        <div className="flex items-center gap-2 lg:hidden ml-auto">
                            {topBar.show_search !== false && (
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all shadow-sm"
                                >
                                    <Search size={18} />
                                </button>
                            )}
                            <button
                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all"
                                onClick={() => setIsOpen(true)}
                                aria-label="Open menu"
                            >
                                <Menu size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Mobile Drawer Backdrop ── */}
            <div
                className={cn(
                    "fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* ── Mobile Drawer (left slide-in) ── */}
            <div className={cn(
                "fixed top-0 left-0 z-[70] h-full w-[300px] bg-white shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Drawer header — logo + close */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <Link href="/" onClick={() => setIsOpen(false)}>
                        {topBar.logo_header ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={topBar.logo_header}
                                alt="First Bencher Logo"
                                className="h-10 w-auto object-contain"
                            />
                        ) : (
                            <span className="text-[22px] font-bold tracking-tight text-gray-800 flex items-center">
                                <span className="text-[var(--primary)]">Fi</span>
                                <span>Study</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] ml-0.5 mt-1.5" />
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu"
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1">

                    {/* Categories */}
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 pt-2 pb-2">
                        Categories
                    </p>
                    <div className="grid grid-cols-2 gap-2 pb-3">
                        {categories.map((cat) => (
                            <Link
                                key={cat.href}
                                href={cat.href}
                                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-accent hover:text-[var(--primary)] transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="text-xl leading-none">{cat.emoji}</span>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-800 leading-tight truncate">{cat.name}</p>
                                    <p className="text-[10px] text-gray-400">{cat.count}+ Courses</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Nav links */}
                    <div className="border-t border-gray-100 pt-2">
                        {navLinks.map((link) => {
                            const hasSubLinks = link.hasDropdown && link.subLinks && link.subLinks.length > 0;
                            const isSubOpen = openMobileSubMenu === link.href;
                            return (
                                <div key={link.href}>
                                    <div className="flex items-center">
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "flex-1 text-sm font-semibold px-4 py-3 rounded-lg transition-colors",
                                                pathname === link.href
                                                    ? "bg-accent text-[var(--primary)]"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            )}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                        {hasSubLinks && (
                                            <button
                                                onClick={() => setOpenMobileSubMenu(isSubOpen ? null : link.href)}
                                                aria-label={isSubOpen ? "Close submenu" : "Open submenu"}
                                                className={cn(
                                                    "w-8 h-8 mr-2 rounded-full flex items-center justify-center border transition-all shrink-0",
                                                    isSubOpen
                                                        ? "bg-accent border-[var(--primary)]/30 text-[var(--primary)]"
                                                        : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                                                )}
                                            >
                                                <ChevronDown
                                                    size={15}
                                                    className={cn("transition-transform duration-200", isSubOpen ? "rotate-180" : "")}
                                                />
                                            </button>
                                        )}
                                    </div>
                                    {hasSubLinks && isSubOpen && (
                                        <div className="pl-6 border-l-2 border-[var(--primary)]/20 ml-6 pb-1 mt-0.5">
                                            {link.subLinks!.map((sub, i) => (
                                                <Link
                                                    key={i}
                                                    href={sub.href}
                                                    className="block text-[13px] font-medium px-2 py-2 text-gray-500 hover:text-[var(--primary)] transition-colors"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Auth buttons pinned to bottom */}
                {topBar.auth_buttons_active !== false && (
                    <div className="shrink-0 p-4 border-t border-gray-100 flex flex-col gap-2.5">
                        <Button
                            variant="outline"
                            href={topBar.login_href || "/login"}
                            className="w-full text-sm font-bold rounded-full py-3"
                            onClick={() => setIsOpen(false)}
                        >
                            {topBar.login_text || "Login"}
                        </Button>
                        <Button
                            href={topBar.register_href || "/register"}
                            className="w-full text-sm font-bold rounded-full py-3"
                            onClick={() => setIsOpen(false)}
                        >
                            {topBar.register_text || "Register"}
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
