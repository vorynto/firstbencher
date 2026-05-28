import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

type FooterContent = {
    tagline: string;
    email: string;
    phone: string;
    address: string;
    facebook_url: string;
    twitter_url: string;
    linkedin_url: string;
    instagram_url: string;
    logo_footer?: string;
    show_socials?: boolean;
    copyright_text?: string;
    company_links?: Array<{ name: string; href: string }>;
    legal_links?: Array<{ name: string; href: string }>;
};

export default function FooterClient({ content }: { content: FooterContent }) {
    const companyLinks = content.company_links || [];
    const legalLinks = content.legal_links || [];
    const currentYear = new Date().getFullYear();
    const copyrightText = (content.copyright_text || "© {year} First Bencher. All rights reserved.").replace("{year}", currentYear.toString());
    return (
        <footer className="bg-[#1E1E2F] text-white pt-12 pb-24">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Company Info */}
                    <div className="flex flex-col gap-6">
                        <Link href="/">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={content.logo_footer || "/logo.png"}
                                alt="First Bencher"
                                width={180}
                                height={60}
                                className="brightness-0 invert object-contain h-[60px] w-auto"
                            />
                        </Link>
                        <p className="text-gray-200 text-sm leading-relaxed">
                            {content.tagline}
                        </p>
                        {content.show_socials !== false && (
                            <div className="flex gap-4">
                                <Link href={content.facebook_url || "#"} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-primary transition-colors">
                                    <Facebook size={18} />
                                </Link>
                                <Link href={content.twitter_url || "#"} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-primary transition-colors">
                                    <Twitter size={18} />
                                </Link>
                                <Link href={content.linkedin_url || "#"} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-primary transition-colors">
                                    <Linkedin size={18} />
                                </Link>
                                <Link href={content.instagram_url || "#"} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-primary transition-colors">
                                    <Instagram size={18} />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                        <ul className="flex flex-col gap-4">
                            {companyLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-gray-200 hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Legal</h4>
                        <ul className="flex flex-col gap-4">
                            {legalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-gray-200 hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Contact Us</h4>
                        <ul className="flex flex-col gap-6">
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <MapPin size={18} className="text-primary" />
                                </div>
                                <div className="text-sm text-gray-200">{content.address}</div>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <Phone size={18} className="text-primary" />
                                </div>
                                <div className="text-sm text-gray-200">{content.phone}</div>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <Mail size={18} className="text-primary" />
                                </div>
                                <div className="text-sm text-gray-200">{content.email}</div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-200 text-xs text-center md:text-left">
                        {copyrightText}
                    </p>
                    <div className="flex gap-6">
                        <span className="text-gray-200 text-xs text-center md:text-right">
                            Developed By{" "}
                            <Link href="https://vorynto.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-semibold">
                                Vorynto Technologies
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
