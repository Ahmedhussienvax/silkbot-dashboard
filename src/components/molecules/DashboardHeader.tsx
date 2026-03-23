"use client";
import React from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { LogOut, Globe, Moon, Sun } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import SearchInput from "./SearchInput";

export default function DashboardHeader({ searchPlaceholder }: { searchPlaceholder: string }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations("Sidebar");
    const supabase = createClient();

    const toggleLocale = () => {
        const nextLocale = locale === "en" ? "ar" : "en";
        router.replace(pathname, { locale: nextLocale });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        toast.info("Session Terminated", { description: "Neural link has been safely disconnected." });
    };

    return (
        <header className="h-24 sticky top-0 z-40 bg-white/5 backdrop-blur-3xl border-b border-white/5 px-10 hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-12 flex-1">
                <SearchInput placeholder={searchPlaceholder} />
            </div>

            <div className="flex items-center gap-6">
                {/* Language Switcher (UX-01) */}
                <button 
                    onClick={toggleLocale}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all group"
                >
                    <Globe className="w-4 h-4 text-slate-500 group-hover:text-accent-primary transition-colors" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{locale === 'en' ? 'AR' : 'EN'}</span>
                </button>

                {/* Logout Action (UX-01 / UI-09) */}
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all group"
                >
                    <LogOut className="w-4 h-4 text-red-500 group-hover:text-white transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t("logout") || "Logout"}</span>
                </button>
            </div>
        </header>
    );
}
