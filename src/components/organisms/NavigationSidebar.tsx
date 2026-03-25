"use client";
import React from "react";
import { motion } from "framer-motion";
import {
    LayoutDashboard, MessageSquare, Send, Settings,
    ChevronRight, LogOut, Sun, Moon, Zap, Users, Shield,
    Columns, Brain, BookOpen, Activity, CreditCard
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Logo from "@/components/atoms/Logo";
import { toast } from "sonner";

import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";

interface NavigationSidebarProps {}

export default function NavigationSidebar({}: NavigationSidebarProps) {
    const t = useTranslations("Sidebar");
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const supabase = createClient();
    const [userRoles, setUserRoles] = useState<{ global: string; tenant: string }>({ global: 'user', tenant: 'agent' });

    useEffect(() => {
        const getRoles = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserRoles({
                    global: user.app_metadata?.global_role || 'user',
                    tenant: user.app_metadata?.tenant_role || 'agent'
                });
            }
        };
        getRoles();
    }, []);

    const navItems = [
        { id: "dashboard", icon: LayoutDashboard, label: t("dashboard"), href: "/dashboard" },
        { id: "bot", icon: Brain, label: t("ai_hub"), href: "/dashboard/bot" },
        { id: "knowledge", icon: BookOpen, label: t("knowledge"), href: "/dashboard/knowledge" },
        { id: "messages", icon: MessageSquare, label: t("inbox"), href: "/dashboard/messages" },
        { id: "broadcast", icon: Send, label: t("campaigns"), href: "/dashboard/broadcast" },
        { id: "kanban", icon: Columns, label: t("kanban"), href: "/dashboard/kanban" },
        { id: "users", icon: Users, label: t("contacts"), href: "/dashboard/users" },
        { id: "health", icon: Activity, label: t("health"), href: "/dashboard/health" },
        { id: "billing", icon: CreditCard, label: t("billing"), href: "/dashboard/billing" },
        { id: "team", icon: Shield, label: "Team Matrix", href: "/dashboard/team" },
        { id: "settings", icon: Settings, label: t("settings"), href: "/dashboard/settings" },
    ];

    const isGlobalAdmin = userRoles.global === 'superadmin' || userRoles.global === 'systemadmin';

    // Filter items based on RBAC (Skill 17)
    const filteredNavItems = navItems.filter(item => {
        if (item.id === 'team' || item.id === 'billing') {
            return isGlobalAdmin || userRoles.tenant === 'owner' || userRoles.tenant === 'manager';
        }
        return true;
    });

    const activeItem = filteredNavItems.find(item => pathname === item.href)?.id || "dashboard";

    return (
        <motion.aside 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-80 h-screen sticky top-0 bg-background/50 backdrop-blur-3xl border-r border-border p-8 flex flex-col justify-between z-50 hidden lg:flex overflow-y-auto overflow-x-hidden custom-scrollbar"
        >
            {/* Glossy Overlay */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-accent-primary/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
                <Link href="/dashboard" className="flex items-center gap-4 mb-16 group/logo cursor-pointer">
                    <Logo size="md" className="group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-foreground tracking-tighter leading-none italic uppercase">SILK<span className="text-accent-primary">BOT</span></span>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 opacity-60">Dashboard v2.0</span>
                    </div>
                </Link>

                <nav className="space-y-4">
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;
                        return (
                            <Link 
                                key={item.id}
                                href={item.href as any}
                                className={cn(
                                    "w-full group/nav flex items-center justify-between p-4 rounded-2xl transition-all duration-500 relative",
                                    isActive 
                                        ? "bg-surface border border-foreground/10 shadow-lg" 
                                        : "hover:bg-surface border border-transparent shadow-none"
                                )}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="nav-active"
                                        className="absolute inset-x-0 inset-y-0 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 pointer-events-none"
                                    />
                                )}
                                
                                <div className="flex items-center gap-4 relative z-10">
                                    <Icon className={cn(
                                        "w-5 h-5 transition-all duration-500",
                                        isActive ? "text-accent-primary scale-110" : "text-muted-foreground group-hover/nav:text-foreground"
                                    )} />
                                    <span className={cn(
                                        "text-[13px] font-black tracking-tight transition-colors duration-500 uppercase",
                                        isActive ? "text-foreground" : "text-muted-foreground group-hover/nav:text-foreground"
                                    )}>
                                        {item.id === "bot" ? t("bot_settings") : item.label}
                                    </span>
                                </div>
                                
                                <ChevronRight className={cn(
                                    "w-4 h-4 transition-all duration-500",
                                    isActive ? "text-accent-primary translate-x-1" : "text-muted-foreground opacity-0 group-hover/nav:opacity-100 group-hover/nav:translate-x-1"
                                )} />
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="relative z-10 space-y-8">
                {/* Theme Switcher Premium */}
                <div className="bg-surface p-2 rounded-3xl border border-foreground/10 flex flex-col gap-2 shadow-2xl">
                    <div className="flex items-center justify-between gap-1">
                        <button 
                            onClick={() => setTheme("light")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                                theme === "light" ? "bg-background text-foreground shadow-xl border border-border" : "text-muted-foreground hover:bg-surface"
                            )}
                        >
                            <Sun className="w-4 h-4" />
                            <span>Light</span>
                        </button>
                        <button 
                            onClick={() => setTheme("dark")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                                theme === "dark" ? "bg-accent-primary text-foreground shadow-xl shadow-accent-primary/20" : "text-muted-foreground hover:bg-surface"
                            )}
                        >
                            <Moon className="w-4 h-4" />
                            <span>Dark</span>
                        </button>
                    </div>
                </div>

                {(!isGlobalAdmin && userRoles.tenant === 'owner') && (
                    <div className="p-6 rounded-3xl bg-surface border border-foreground/10 relative overflow-hidden group/upgrade">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-accent-secondary/10 blur-2xl rounded-full" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Pro Version</p>
                        <p className="text-foreground font-black text-sm mb-4 leading-snug">Sync your business data across devices</p>
                        <Link 
                            href="/pricing"
                            className="block w-full text-center py-3 bg-foreground text-background font-bold text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-transform active:scale-95 shadow-xl"
                        >
                            Upgrade
                        </Link>
                    </div>
                )}

                <button 
                    onClick={() => {
                        toast.info("Session Terminated", { description: "You have been safely logged out." });
                        router.push("/login"); // Mock logout for UI demo
                    }}
                    className="w-full group/logout flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-red-500/20 hover:bg-red-500/5 transition-all"
                >
                    <div className="w-10 h-10 rounded-xl bg-surface border border-foreground/10 flex items-center justify-center group-hover/logout:bg-red-500 text-muted-foreground group-hover/logout:text-foreground transition-all shadow-lg active:scale-95">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover/logout:text-red-500 transition-colors">
                        {t("logout")}
                    </span>
                </button>
            </div>

            {/* Ambient Background Lights */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-primary/5 blur-[80px] rounded-full pointer-events-none" />
        </motion.aside>
    );
}
