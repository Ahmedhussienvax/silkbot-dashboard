"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronLeft, Mail, MessageSquare, MapPin, Send } from "lucide-react";
import Footer from "@/components/organisms/Footer";

export default function ContactPage() {
    const t = useTranslations("Common");

    return (
        <main className="min-h-screen bg-background flex flex-col items-center selection:bg-accent-primary/30">
            <div className="w-full max-w-4xl px-8 py-20 flex-1">
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic font-bold uppercase tracking-widest italic transition-colors">Back to Reality</span>
                </Link>

                <div className="space-y-16">
                    <header>
                        <h1 className="text-6xl font-black text-foreground italic tracking-tighter uppercase mb-6">
                            SIGNAL<span className="text-accent-primary">_EMISSION</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium leading-relaxed italic">
                            Have a neural query? Reach out to our engineers.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="glass-card p-10 space-y-10">
                            <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Direct Channels</h2>
                            <div className="space-y-8">
                                <div className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-accent-primary transition-all group-hover:bg-accent-primary/10">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 italic">Email Domain</div>
                                        <div className="text-foreground font-black text-lg tracking-tight">ops@silkbot.neural</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-accent-secondary transition-all group-hover:bg-accent-secondary/10">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 italic">Neural Support</div>
                                        <div className="text-foreground font-black text-lg tracking-tight">Live Chat via Dashboard</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-10 bg-accent-primary/5 border-accent-primary/10 flex flex-col justify-between group">
                            <div>
                                <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter mb-4">Urgent Intel</h3>
                                <p className="text-muted-foreground font-medium leading-relaxed text-sm italic">
                                    Response priority level: <span className="text-accent-primary">CRITICAL</span>. Response window usually 4.5ms - 2h.
                                </p>
                            </div>
                            <button className="w-full py-5 bg-white text-black font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 mt-10">
                                Send Signal Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
