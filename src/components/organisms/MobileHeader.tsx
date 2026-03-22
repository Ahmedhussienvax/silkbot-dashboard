"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, LayoutDashboard, MessageSquare, Send, Users, Settings, LogOut } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function MobileHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations("Sidebar");
    const pathname = usePathname();

    const navItems = [
        { id: "dashboard", icon: LayoutDashboard, label: t("dashboard"), href: "/dashboard" },
        { id: "messages", icon: MessageSquare, label: t("inbox"), href: "/dashboard/messages" },
        { id: "broadcast", icon: Send, label: t("campaigns"), href: "/dashboard/broadcast" },
        { id: "users", icon: Users, label: t("contacts"), href: "/dashboard/users" },
        { id: "settings", icon: Settings, label: t("settings"), href: "/dashboard/settings" },
    ];

    const activeItem = navItems.find(item => pathname === item.href)?.id || "dashboard";

    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between z-[100]">
            <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]">
                    <Zap className="w-5 h-5 text-white fill-white/20" />
                </div>
                <span className="text-xl font-black text-white tracking-tighter italic">SILK<span className="text-accent-primary">BOT</span></span>
            </Link>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
            >
                {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] top-20"
                        />

                        {/* Drawer */}
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-20 right-0 bottom-0 w-[80%] bg-[#0A0A0A] border-l border-white/5 z-[100] p-8 flex flex-col justify-between"
                        >
                            <nav className="space-y-4">
                                {navItems.map((item) => (
                                    <Link 
                                        key={item.id}
                                        href={item.href as any}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "w-full flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 relative",
                                            activeItem === item.id 
                                                ? "bg-accent-primary/10 border border-accent-primary/20" 
                                                : "bg-white/5 border border-white/5"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "w-6 h-6",
                                            activeItem === item.id ? "text-accent-primary" : "text-slate-500"
                                        )} />
                                        <span className={cn(
                                            "text-sm font-black uppercase tracking-widest",
                                            activeItem === item.id ? "text-white" : "text-slate-500"
                                        )}>
                                            {item.label}
                                        </span>
                                    </Link>
                                ))}
                            </nav>

                            <div className="space-y-6">
                                <button className="w-full flex items-center gap-5 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                                    <LogOut className="w-6 h-6" />
                                    <span className="text-sm font-black uppercase tracking-widest">{t("logout")}</span>
                                </button>
                                
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5">
                                    <p className="text-[10px] font-black text-accent-primary uppercase tracking-widest mb-1">SilkBot Pro</p>
                                    <p className="text-white font-black text-xs leading-none">Cloud Intelligence Active</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
