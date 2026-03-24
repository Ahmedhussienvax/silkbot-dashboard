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
        toast.info("Session Terminated", { description: "You have been safely logged out." });
    };

    return (
        <header className="h-24 sticky top-0 z-40 bg-surface backdrop-blur-3xl border-b border-glass-border px-10 hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-12 flex-1 relative">
                <SearchInput placeholder={searchPlaceholder} />
                <div className="absolute -bottom-[1px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>

            <div className="flex items-center gap-6">
                {/* Language Switcher (UX-01) */}
                <button 
                    onClick={toggleLocale}
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-glass-border rounded-xl hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all group shadow-sm"
                >
                    <Globe className="w-4 h-4 text-muted-foreground group-hover:text-accent-primary transition-colors" />
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{locale === 'en' ? 'AR' : 'EN'}</span>
                </button>

                {/* Logout Action (UX-01 / UI-09) */}
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-foreground transition-all group shadow-sm"
                >
                    <LogOut className="w-4 h-4 text-red-500 group-hover:text-foreground transition-colors" />
                    <span className="text-[10px] font-black text-red-500 group-hover:text-foreground uppercase tracking-widest transition-colors">{t("logout")}</span>
                </button>
            </div>
        </header>
    );
}
