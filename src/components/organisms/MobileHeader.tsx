"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, LayoutDashboard, MessageSquare, Send, Users, Settings, LogOut } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Logo from "@/components/atoms/Logo";
import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function MobileHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations("Sidebar");
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const supabase = createClient();

    const toggleLocale = () => {
        const nextLocale = locale === "en" ? "ar" : "en";
        router.replace(pathname, { locale: nextLocale });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const navItems = [
        { id: "dashboard", icon: LayoutDashboard, label: t("dashboard"), href: "/dashboard" },
        { id: "messages", icon: MessageSquare, label: t("inbox"), href: "/dashboard/messages" },
        { id: "broadcast", icon: Send, label: t("campaigns"), href: "/dashboard/broadcast" },
        { id: "users", icon: Users, label: t("contacts"), href: "/dashboard/users" },
        { id: "settings", icon: Settings, label: t("settings"), href: "/dashboard/settings" },
    ];

    const activeItem = navItems.find(item => pathname === item.href)?.id || "dashboard";

    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-background border-b border-glass-border px-6 flex items-center justify-between z-[100] shadow-xl">
            <Link href="/dashboard" className="flex items-center gap-3">
                <Logo size="sm" />
                <span className="text-xl font-black text-foreground tracking-tighter italic uppercase">SILK<span className="text-accent-primary">BOT</span></span>
            </Link>

            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleLocale}
                    className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-glass-border active:scale-95 transition-all text-[10px] font-black text-foreground"
                >
                    {locale === 'en' ? 'AR' : 'EN'}
                </button>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isOpen}
                    className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-glass-border active:scale-95 transition-all"
                >
                    {isOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-background/80 backdrop-blur-md z-[90]"
                        />

                        {/* Drawer */}
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[85%] bg-background border-l border-glass-border z-[100] p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
                        >
                            <div className="relative z-10 space-y-12">
                                <div className="flex items-center justify-between mb-8">
                                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                                        <Logo size="sm" />
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black text-foreground tracking-tighter italic uppercase">SILK<span className="text-accent-primary">BOT</span></span>
                                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Architect v2.0</span>
                                        </div>
                                    </Link>
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-glass-border active:scale-95 transition-all"
                                    >
                                        <X className="w-5 h-5 text-foreground" />
                                    </button>
                                </div>

                                <nav className="space-y-3">
                                    {navItems.map((item) => (
                                            <Link 
                                                key={item.id}
                                                href={item.href as any}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "w-full flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 relative",
                                                    activeItem === item.id 
                                                        ? "bg-accent-primary/10 border border-accent-primary/20 shadow-lg shadow-accent-primary/5" 
                                                        : "bg-foreground/5 border border-glass-border hover:bg-foreground/[0.08]"
                                                )}
                                            >
                                                <item.icon className={cn(
                                                    "w-6 h-6 transition-colors",
                                                    activeItem === item.id ? "text-accent-primary" : "text-text-muted"
                                                )} />
                                                <span className={cn(
                                                    "text-sm font-black uppercase tracking-widest transition-colors",
                                                    activeItem === item.id ? "text-foreground" : "text-text-muted"
                                                )}>
                                                    {item.label}
                                                </span>
                                            </Link>
                                    ))}
                                </nav>
                            </div>

                            <div className="space-y-6 pt-12">
                                <Link 
                                    href="/pricing"
                                    onClick={() => setIsOpen(false)}
                                    className="block p-8 rounded-[2rem] bg-gradient-to-br from-accent-primary to-accent-secondary border border-white/20 shadow-2xl relative overflow-hidden group/upgrade transition-transform active:scale-95"
                                >
                                    <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-700" />
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1 italic">SilkBot Pro Integration</p>
                                    <p className="text-white font-black text-lg leading-tight uppercase tracking-tighter italic">Upgrade to<br />Enterprise Hub</p>
                                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest bg-black/20 px-4 py-2 rounded-xl">
                                        Activate 7-Day Free Trial
                                    </div>
                                </Link>

                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-5 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group active:scale-95"
                                >
                                    <LogOut className="w-6 h-6 text-red-500 group-hover:text-white" />
                                    <span className="text-sm font-black uppercase tracking-widest">{t("logout")}</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
