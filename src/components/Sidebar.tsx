"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";

export default function Sidebar({ userEmail }: { userEmail: string }) {
    const t = useTranslations("Sidebar");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const navItems = [
        { href: "/dashboard", icon: "📊", label: t("dashboard") },
        { href: "/dashboard/inbox", icon: "💬", label: t("inbox") },
        { href: "/dashboard/contacts", icon: "👥", label: t("contacts") },
        { href: "/dashboard/campaigns", icon: "📢", label: t("campaigns") },
        { href: "/dashboard/whatsapp", icon: "📱", label: t("whatsapp") },
        { href: "/dashboard/bot", icon: "🤖", label: t("bot_settings") },
        { href: "/dashboard/knowledge", icon: "📚", label: t("knowledge") },
        { href: "/dashboard/audit", icon: "🕵️", label: t("audit_log") },
        { href: "/dashboard/settings", icon: "⚙️", label: t("settings") },
    ];

    const isActive = (href: string) => {
        const normalizedPath = pathname.replace(`/${locale}`, "") || "/";
        if (href === "/dashboard") return normalizedPath === "/dashboard";
        return normalizedPath.startsWith(href);
    };

    const toggleLanguage = () => {
        const newLocale = locale === "ar" ? "en" : "ar";
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        router.push(newPath);
    };

    return (
        <>
            {/* Mobile Hamburger */}
            <button
                onClick={() => setOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden w-11 h-11 rounded-2xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white shadow-2xl hover:bg-slate-800/50 transition-all focus-visible:ring-2 focus-visible:ring-purple-500 outline-none"
                aria-label="Open menu"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>

            {/* Overlay (mobile) */}
            {open && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:static z-50 inset-y-0 ${locale === "ar" ? "right-0" : "left-0"} w-72 bg-slate-950/50 backdrop-blur-3xl border-x border-white/5 flex flex-col transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    open ? "translate-x-0" : (locale === "ar" ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0")
                }`}
            >
                {/* Logo */}
                <div className="p-8 pb-10">
                    <div className="flex items-center gap-4 sidebar-logo group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-purple-500/20 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                            S
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                SilkBot
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">Enterprise</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href as any}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                                    active
                                        ? "bg-white/[0.05] text-white border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                                        : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]"
                                }`}
                            >
                                <span className={`text-xl transition-all duration-300 ${active ? "scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "grayscale group-hover:grayscale-0 group-hover:scale-110"}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-sm font-bold tracking-wide ${active ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                                    {item.label}
                                </span>
                                {active && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / User */}
                <div className="p-6 mt-auto border-t border-white/5 space-y-4">
                    {/* Language Switcher */}
                    <button 
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-between px-5 py-3.5 bg-white/[0.03] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all group"
                    >
                        <span className="flex items-center gap-2">
                            <span className="opacity-50 group-hover:opacity-100 transition-opacity">🌐</span>
                            {locale === "ar" ? "English (US)" : "العربية (مصر)"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px]">{locale === "ar" ? "LTR" : "RTL"}</span>
                    </button>

                    <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/[0.03] to-purple-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-purple-500/20 border border-white/10">
                            {userEmail?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-tighter mb-0.5">Admin Account</p>
                            <p className="text-sm font-bold text-white truncate">{userEmail}</p>
                        </div>
                    </div>
                    
                    <form action="/auth/signout" method="POST">
                        <button className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-red-500 transition-all">
                            Sign Out Securely
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
