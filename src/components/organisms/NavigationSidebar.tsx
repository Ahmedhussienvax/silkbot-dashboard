"use client";
import React from "react";
import { motion } from "framer-motion";
import {
    LayoutDashboard, MessageSquare, Send, Settings,
    ChevronRight, LogOut, Sun, Moon, Zap, Users,
    Columns
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Logo from "@/components/atoms/Logo";

import { useTranslations } from "next-intl";

interface NavigationSidebarProps {}

export default function NavigationSidebar({}: NavigationSidebarProps) {
    const t = useTranslations("Sidebar");
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();

    const navItems = [
        { id: "dashboard", icon: LayoutDashboard, label: t("dashboard"), href: "/dashboard" },
        { id: "kanban", icon: Columns, label: t("kanban"), href: "/dashboard/kanban" },
        { id: "messages", icon: MessageSquare, label: t("inbox"), href: "/dashboard/messages" },
        { id: "broadcast", icon: Send, label: t("campaigns"), href: "/dashboard/broadcast" },
        { id: "users", icon: Users, label: t("contacts"), href: "/dashboard/users" },
        { id: "settings", icon: Settings, label: t("settings"), href: "/dashboard/settings" },
    ];

    const activeItem = navItems.find(item => pathname === item.href)?.id || "dashboard";

    return (
        <motion.aside 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-80 h-screen sticky top-0 bg-black/20 backdrop-blur-3xl border-r border-white/5 p-8 flex flex-col justify-between z-50 hidden lg:flex overflow-hidden"
        >
            {/* Glossy Overlay */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-accent-primary/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
                <Link href="/dashboard" className="flex items-center gap-4 mb-16 group/logo cursor-pointer">
                    <Logo size="md" className="group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white tracking-tighter leading-none italic uppercase">SILK<span className="text-accent-primary">BOT</span></span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 opacity-60">Architect v2.0</span>
                    </div>
                </Link>

                <nav className="space-y-4">
                    {navItems.map((item) => (
                        <Link 
                            key={item.id}
                            href={item.href as any}
                            className={cn(
                                "w-full group/nav flex items-center justify-between p-4 rounded-2xl transition-all duration-500 relative",
                                activeItem === item.id 
                                    ? "bg-white/5 border border-white/10 shadow-2xl" 
                                    : "hover:bg-white/[0.03] border border-transparent shadow-none"
                            )}
                        >
                            {activeItem === item.id && (
                                <motion.div 
                                    layoutId="nav-active"
                                    className="absolute inset-x-0 inset-y-0 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 pointer-events-none"
                                />
                            )}
                            
                            <div className="flex items-center gap-4 relative z-10">
                                <item.icon className={cn(
                                    "w-5 h-5 transition-all duration-500",
                                    activeItem === item.id ? "text-accent-primary scale-110" : "text-slate-500 group-hover/nav:text-slate-300"
                                )} />
                                <span className={cn(
                                    "text-[13px] font-black tracking-tight transition-colors duration-500 uppercase",
                                    activeItem === item.id ? "text-white" : "text-slate-500 group-hover/nav:text-slate-300"
                                )}>
                                    {item.label}
                                </span>
                            </div>
                            
                            <ChevronRight className={cn(
                                "w-4 h-4 transition-all duration-500",
                                activeItem === item.id ? "text-accent-primary translate-x-1" : "text-slate-700 opacity-0 group-hover/nav:opacity-100 group-hover/nav:translate-x-1"
                            )} />
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="relative z-10 space-y-8">
                {/* Theme Switcher Premium */}
                <div className="bg-black/40 p-2 rounded-3xl border border-white/5 flex flex-col gap-2 shadow-2xl">
                    <div className="flex items-center justify-between gap-1">
                        <button 
                            onClick={() => setTheme("light")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                                theme === "light" ? "bg-white text-black shadow-xl" : "text-slate-500 hover:bg-white/5"
                            )}
                        >
                            <Sun className="w-4 h-4" />
                            <span>Light</span>
                        </button>
                        <button 
                            onClick={() => setTheme("dark")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                                theme === "dark" ? "bg-accent-primary text-white shadow-xl shadow-accent-primary/20" : "text-slate-500 hover:bg-white/5"
                            )}
                        >
                            <Moon className="w-4 h-4" />
                            <span>Dark</span>
                        </button>
                    </div>
                    
                    {/* Language Switcher UI-10 */}
                    <div className="flex items-center justify-between gap-1 border-t border-white/5 pt-2 mt-1">
                        <button 
                            onClick={() => router.replace(pathname, { locale: 'en' })}
                            className={cn(
                                "flex-1 flex items-center justify-center py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                                locale === 'en' ? "bg-white/10 text-white border border-white/10" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            EN
                        </button>
                        <button 
                            onClick={() => router.replace(pathname, { locale: 'ar' })}
                            className={cn(
                                "flex-1 flex items-center justify-center py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                                locale === 'ar' ? "bg-white/10 text-white border border-white/10" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            AR
                        </button>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 relative overflow-hidden group/upgrade">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-accent-secondary/10 blur-2xl rounded-full" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Pro Version</p>
                    <p className="text-white font-black text-sm mb-4 leading-snug">Empower your AI with Cloud Sync</p>
                    <button className="w-full py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-transform active:scale-95 shadow-xl">
                        Upgrade
                    </button>
                </div>

                <button className="w-full group/logout flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-red-500/20 hover:bg-red-500/5 transition-all transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/logout:bg-red-500 text-slate-500 group-hover/logout:text-white transition-all shadow-lg active:scale-95">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest group-hover/logout:text-white">{t("logout")}</span>
                </button>
            </div>

            {/* Ambient Background Lights */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-primary/5 blur-[80px] rounded-full pointer-events-none" />
        </motion.aside>
    );
}
