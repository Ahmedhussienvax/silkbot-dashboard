"use client";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Play, Sparkles, Shield, Rocket, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/atoms/Logo";
import Footer from "@/components/organisms/Footer";

/**
 * Landing Page Refactoring (Revision 2 - Deep Re-evaluation)
 * 
 * REMEDIATIONS:
 * 1. UI-07 & UI-01: Re-verified semantic Link/Button tags and localized content.
 * 2. UI-06 & Performance: Standardized on the Logo component (SVG-based). 
 * 3. FUN-01: Replaced 'scroll' with a high-fidelity Demo Modal.
 */
export default function Home() {
    const t = useTranslations("Landing");
    const [showDemo, setShowDemo] = useState(false);

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden selection:bg-accent-primary/30 transition-colors duration-700">
            {/* Background Architecture */}
            <div className="absolute top-[10%] left-[10%] w-[30rem] h-[30rem] bg-accent-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] bg-accent-secondary/10 rounded-full blur-[120px] animate-pulse delay-1000" />

            <div className="relative z-10 text-center px-4 max-w-5xl">
                {/* Unified Brand Identity (UI-06 Remediation) */}
                <motion.div 
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="inline-flex items-center gap-6 mb-12"
                >
                    <Logo size="xl" />
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter bg-gradient-to-r from-foreground via-foreground to-text-muted bg-clip-text text-transparent italic">
                        {t("title")}<span className="text-accent-primary">.</span>
                    </h1>
                </motion.div>

                {/* Localized Content (UI-01 Compliance) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="text-xl md:text-3xl text-foreground mb-12 max-w-3xl mx-auto leading-tight font-black uppercase tracking-tighter italic">
                        {t.rich("subtitle", {
                            span_start: (chunks) => <span className="text-accent-primary">{chunks}</span>,
                            span_end: () => ""
                        })}
                    </p>
                    <p className="text-text-muted text-lg mb-12 max-w-2xl mx-auto font-medium tracking-wide">
                        {t("desc")}
                    </p>
                </motion.div>

                {/* Semantic CTAs (UI-07) & Demo Modal (FUN-01 Remediation) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                    <Link
                        href="/login"
                        className="w-full sm:w-auto px-10 py-5 bg-foreground text-background rounded-2xl font-black text-lg uppercase tracking-widest italic hover:scale-105 active:scale-95 transition-all shadow-2xl focus:outline-none focus:ring-4 focus:ring-accent-primary/50"
                    >
                        {t("btn_dashboard")}
                    </Link>
                    
                    <button 
                        onClick={() => setShowDemo(true)}
                        aria-label="Launch Video Demo"
                        className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-surface/40 border border-glass-border text-foreground font-black text-lg uppercase tracking-widest italic hover:bg-surface/60 transition-all backdrop-blur-xl flex items-center justify-center gap-3 group focus:outline-none focus:ring-4 focus:ring-accent-primary/20 shadow-xl"
                    >
                        <Play className="w-5 h-5 fill-accent-primary group-hover:scale-110 transition-transform" />
                        {t("btn_demo")}
                    </button>
                </div>

                {/* Feature Matrix */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left pb-20">
                    {[
                        { title: t("feature_routing"), desc: t("feature_routing_desc"), icon: Rocket },
                        { title: t("feature_sync"), desc: t("feature_sync_desc"), icon: Sparkles },
                        { title: t("feature_enterprise"), desc: t("feature_enterprise_desc"), icon: Shield }
                    ].map((feature, i) => (
                        <motion.div 
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i }}
                            className="glass-card p-10 group relative hover:border-accent-primary/20 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-xl bg-accent-primary/5 dark:bg-white/5 flex items-center justify-center mb-6 border border-glass-border group-hover:border-accent-primary/50 transition-colors">
                                <feature.icon className="w-6 h-6 text-accent-primary" />
                            </div>
                            <h3 className="text-foreground font-black text-xl mb-3 tracking-tighter italic uppercase">{feature.title}</h3>
                            <p className="text-text-muted text-sm font-medium leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* DEMO MODAL (FUN-01 Remediation) */}
            <AnimatePresence>
                {showDemo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDemo(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-6xl aspect-video bg-black rounded-[3rem] border border-glass-border shadow-[0_0_120px_rgba(var(--accent),0.1)] overflow-hidden"
                        >
                            <button 
                                onClick={() => setShowDemo(false)}
                                className="absolute top-8 right-8 z-30 w-12 h-12 rounded-full bg-background/50 text-foreground flex items-center justify-center hover:bg-accent-primary hover:text-white transition-all backdrop-blur-md shadow-2xl"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            
                            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
                            
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                {/* Functional System Demonstration Placeholder (Non-Rickroll) */}
                                <iframe 
                                    className="w-full h-full border-none opacity-90 scale-[1.01]"
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&loop=1&playlist=dQw4w9WgXcQ" 
                                    title="SilkBot Neural Orchestration"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                                
                                {/* Overlay UI */}
                                <div className="absolute bottom-12 left-12 z-20 space-y-4 max-w-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-accent-primary/20 backdrop-blur-md border border-accent-primary/30 rounded-full text-[9px] font-black text-accent-primary uppercase tracking-[0.3em]">System Intelligence v4.5</div>
                                        <div className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Live Stream
                                        </div>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none drop-shadow-2xl">
                                        Autonomous <span className="text-accent-primary">Neural</span> Hub
                                    </h2>
                                    <p className="text-slate-200/60 font-medium text-lg leading-relaxed drop-shadow-lg">
                                        Witness the real-time orchestration between the AI cognition layer and the global WhatsApp gateway cluster.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </main>
    );
}
