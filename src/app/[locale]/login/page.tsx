"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Logo from "@/components/atoms/Logo";
import { Zap, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Tier-1 Authentication Module: LoginPage
 * 
 * REMEDIATION ACTIONS (QA-v3.0):
 * 1. UI-01: Decoupled hardcoded directionality. Now follows [locale] metadata.
 * 2. UI-02: Suppressed browser validation bubbles (noValidate). Implemented custom high-fidelity feedback.
 * 3. A11Y: Added proper ARIA roles and labels for screen readers.
 * 4. PERFORMANCE: Optimized Framer Motion transitions for deterministic render cycles.
 */
export default function LoginPage() {
    const t = useTranslations("Login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Clear loading if component unmounts
    useEffect(() => {
        return () => setLoading(false);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        // Custom validation check before submission
        if (!email || !password) {
            setError(t("card_desc")); // Fallback if user tries to bypass
            return;
        }

        setLoading(true);
        setError("");
        
        try {
            const supabase = createClient();
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message === "Invalid login credentials" ? t("error_credentials") : authError.message);
                setLoading(false);
            } else if (data?.user) {
                // Successful DOM reconciliation after authentication
                router.push("/dashboard");
            } else {
                setError(t("error_unexpected"));
                setLoading(false);
            }
        } catch (err: any) {
            setError(t("error_server"));
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden transition-colors duration-700">
            {/* Visual Architecture: Gradient Pulse Optimization */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/15 rounded-full blur-[120px] animate-pulse delay-1000" />

            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Branding Block */}
                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                       <div className="flex flex-col items-center mb-10 overflow-visible">
                            <Logo size="lg" className="mb-6" />
                            <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-text-dim italic">
                                {t("title")}<span className="text-accent-primary">.</span>
                            </h1>
                        </div>
                    </motion.div>
                    <p className="text-text-dim text-sm font-black uppercase tracking-[0.2em]">{t("subtitle")}</p>
                </div>

                {/* Authentication Matrix */}
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="glass-card rounded-[2.5rem] p-10 border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-foreground mb-2 italic">{t("card_title")}</h2>
                        <p className="text-text-muted text-sm font-medium leading-relaxed">
                            {t("card_desc")}
                        </p>
                    </div>

                    <form onSubmit={handleLogin} noValidate className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email-input" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                                {t("email_label")}
                            </label>
                            <input
                                id="email-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("email_placeholder")}
                                autoComplete="email"
                                className="w-full px-6 py-4 rounded-2xl bg-surface border border-glass-border text-foreground placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all font-medium text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password-input" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                                {t("password_label")}
                            </label>
                            <input
                                id="password-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t("password_placeholder")}
                                autoComplete="current-password"
                                className="w-full px-6 py-4 rounded-2xl bg-surface border border-glass-border text-foreground placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all font-medium text-sm"
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-xs font-black uppercase tracking-widest">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            aria-busy={loading}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-black uppercase tracking-[0.2em] italic hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_-10px_rgba(var(--accent-rgb),0.3)] mt-4"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {t("btn_checking")}
                                </span>
                            ) : (
                                t("btn_login")
                            )}
                        </button>
                    </form>
                </motion.div>

                <div className="text-center mt-12 space-y-6">
                    <Link 
                        href="/register"
                        className="inline-block text-accent-primary text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all italic decoration-accent-primary underline-offset-8 hover:underline"
                    >
                        {t("no_account")}
                    </Link>
                    <div className="h-[1px] w-8 bg-foreground/10 mx-auto opacity-20" />
                    <p className="text-text-dim text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
                        {t("footer")}
                    </p>
                </div>
            </div>
        </main>
    );
}
