"use client";
import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Logo from "@/components/atoms/Logo";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

export default function Footer() {
    const t = useTranslations("Footer");

    return (
        <footer className="w-full bg-black/20 backdrop-blur-3xl border-t border-white/5 py-20 px-8 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3 group/logo">
                            <Logo size="md" />
                            <span className="text-xl font-black text-white italic uppercase tracking-tighter">
                                SILK<span className="text-accent-primary">BOT</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                            {t("mission_desc")}
                        </p>
                        <div className="flex items-center gap-4">
                            {[Github, Twitter, Linkedin].map((Icon, i) => (
                                <button key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-accent-primary/30 transition-all">
                                    <Icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{t("platform")}</h4>
                        <ul className="space-y-4">
                            {['dashboard', 'campaigns', 'api_docs', 'pricing'].map((item) => (
                                <li key={item}>
                                    <Link href={`/dashboard`} className="text-slate-400 hover:text-accent-primary text-sm font-bold uppercase tracking-tighter transition-colors">
                                        {t(`link_${item}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{t("company")}</h4>
                        <ul className="space-y-4">
                            {['about', 'contact', 'careers', 'blog'].map((item) => (
                                <li key={item}>
                                    <Link href={`/${item}` as any} className="text-slate-400 hover:text-accent-primary text-sm font-bold uppercase tracking-tighter transition-colors">
                                        {t(`link_${item}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{t("legal")}</h4>
                        <ul className="space-y-4">
                            {['privacy', 'terms', 'security', 'cookies'].map((item) => (
                                <li key={item}>
                                    <Link href={`/${item}` as any} className="text-slate-400 hover:text-accent-primary text-sm font-bold uppercase tracking-tighter transition-colors">
                                        {t(`link_${item}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                        © 2026 SILKBOT NEURAL HUB. ALL RIGHTS RESERVED.
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                        MADE WITH <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> FOR THE AUTOMATION REVOLUTION
                    </div>
                </div>
            </div>
        </footer>
    );
}
