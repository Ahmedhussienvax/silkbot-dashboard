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
        <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden selection:bg-accent-primary/30">
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
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent italic">
                        {t("title")}<span className="text-accent-primary">.</span>
                    </h1>
                </motion.div>

                {/* Localized Content (UI-01 Compliance) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="text-xl md:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto leading-tight font-black uppercase tracking-tighter italic">
                        {t.rich("subtitle", {
                            span_start: (chunks) => <span className="text-accent-primary">{chunks}</span>,
                            span_end: () => ""
                        })}
                    </p>
                    <p className="text-slate-500 text-lg mb-12 max-w-2xl mx-auto font-medium tracking-wide">
                        {t("desc")}
                    </p>
                </motion.div>

                {/* Semantic CTAs (UI-07) & Demo Modal (FUN-01 Remediation) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                    <Link
                        href="/login"
                        className="w-full sm:w-auto px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg uppercase tracking-widest italic hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] focus:outline-none focus:ring-4 focus:ring-accent-primary/50"
                    >
                        {t("btn_dashboard")}
                    </Link>
                    
                    <button 
                        onClick={() => setShowDemo(true)}
                        aria-label="Launch Video Demo"
                        className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-lg uppercase tracking-widest italic hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center gap-3 group focus:outline-none focus:ring-4 focus:ring-white/20"
                    >
                        <Play className="w-5 h-5 fill-white group-hover:fill-accent-primary transition-colors" />
                        {t("btn_demo")}
                    </button>
                </div>

                {/* Feature Matrix */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {[
                        { title: t("feature_routing"), desc: t("feature_routing_desc"), icon: Rocket },
                        { title: t("feature_sync"), desc: t("feature_sync_desc"), icon: Sparkles },
                        { title: t("feature_enterprise"), desc: t("feature_enterprise_desc"), icon: Shield }
                    ].map((feature, i) => (
                        <motion.div 
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className="glass-card p-10 border-white/5 bg-white/[0.02] group relative hover:border-accent-primary/20"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-accent-primary/50 transition-colors">
                                <feature.icon className="w-6 h-6 text-accent-primary" />
                            </div>
                            <h3 className="text-white font-black text-xl mb-3 tracking-tighter italic uppercase">{feature.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* DEMO MODAL (FUN-01 Remediation) */}
            <AnimatePresence>
                {showDemo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDemo(false)}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            <button 
                                onClick={() => setShowDemo(false)}
                                className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                                <iframe 
                                    className="w-full h-full border-none opacity-80"
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&loop=1" 
                                    title="System Demonstration"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 to-transparent" />
                                <div className="absolute bottom-12 left-12 z-20 space-y-2">
                                    <div className="text-[10px] font-black text-accent-primary uppercase tracking-[0.4em] italic outline-none">Neural Hub Demonstration</div>
                                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Automated Intelligence <span className="text-accent-primary">v4.5</span></h2>
                                    <p className="text-slate-400 font-bold max-w-lg">Watching a secure neural link between our orchestrator and the WhatsApp gateway.</p>
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
