"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronLeft, Info, Target, Users } from "lucide-react";
import Footer from "@/components/organisms/Footer";

export default function AboutPage() {
    const t = useTranslations("Common");
    const l = useTranslations("Landing");

    return (
        <main className="min-h-screen bg-background flex flex-col items-center selection:bg-accent-primary/30">
            <div className="w-full max-w-4xl px-8 py-20 flex-1">
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">{l("back_home") || "Back to Reality"}</span>
                </Link>

                <div className="space-y-16">
                    <header>
                        <h1 className="text-6xl font-black text-foreground italic tracking-tighter uppercase mb-6">
                            SYSTEM<span className="text-accent-primary">_BIOGRAPHY</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium leading-relaxed italic">
                            SilkBot is not just a platform; it is the next iteration of neural commerce orchestration.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="glass-card p-10 border-border bg-surface flex flex-col gap-6">
                            <Target className="w-8 h-8 text-accent-primary" />
                            <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Core Mission</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">To provide businesses with autonomous communication agents that bridge the gap between deterministic logic and human nuance.</p>
                        </div>
                        <div className="glass-card p-10 border-border bg-surface flex flex-col gap-6">
                            <Users className="w-8 h-8 text-accent-secondary" />
                            <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">The Collective</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">Built by a global network of engineers dedicated to open neural standards and secure data propagation.</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
