"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { ChevronLeft, ShieldCheck, CreditCard, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const planName = searchParams.get("plan") || "Hub";
    const price = searchParams.get("price") || "$149";
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login?redirect=/checkout");
            }
        };
        checkUser();
    }, [router, supabase]);

    const handlePayment = async () => {
        setStatus('processing');
        // Simulated Neural Payment Gateway Integration
        await new Promise(resolve => setTimeout(resolve, 3000));
        setStatus('success');
        toast.success("Transaction Synced", { description: "Your account has been upgraded to the selected node level." });
        setTimeout(() => router.push("/dashboard"), 2000);
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-8 overflow-hidden relative">
            {/* Background Aesthetics */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-50" />
            <div className="absolute top-[20%] left-[20%] w-[40rem] h-[40rem] bg-accent-primary/5 rounded-full blur-[120px] animate-pulse" />

            <div className="w-full max-w-xl relative z-10">
                <Link href="/pricing" className="inline-flex items-center gap-2 text-dim-foreground hover:text-foreground transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic text-muted-foreground">Adjust Configuration</span>
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-12 space-y-10 border-accent-primary/20 shadow-[0_40px_100px_rgba(0,0,0,0.4)]"
                >
                    <header className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-4xl font-black text-foreground italic uppercase tracking-tighter">Secure <span className="text-accent-primary">Checkout</span></h2>
                            <ShieldCheck className="w-8 h-8 text-accent-primary opacity-50" />
                        </div>
                        <p className="text-dim-foreground text-xs font-black uppercase tracking-widest italic opacity-60">Authorize Neural Upgrade Path</p>
                    </header>

                    <div className="space-y-6">
                        {/* Plan Summary */}
                        <div className="p-8 bg-surface dark:bg-surface rounded-[2rem] border border-glass-border space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-dim-foreground uppercase tracking-widest italic">Selected Node</div>
                                    <div className="text-2xl font-black text-foreground italic uppercase tracking-tighter flex items-center gap-3">
                                        {planName} 
                                        {planName === 'Hub' && <Sparkles className="w-5 h-5 text-accent-primary" />}
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-foreground tracking-tighter">{price}</div>
                            </div>
                            <div className="h-[1px] bg-glass-border w-full" />
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-dim-foreground italic">
                                <span>Infrastructure Fee</span>
                                <span className="text-foreground">$0.00 (Included)</span>
                            </div>
                        </div>

                        {/* Payment Mock Elements */}
                        <div className="space-y-4">
                            <div className="p-6 bg-surface border border-glass-border rounded-2xl flex items-center justify-between hover:border-accent-primary/30 transition-all cursor-not-allowed opacity-80 group">
                                <div className="flex items-center gap-4">
                                    <CreditCard className="w-6 h-6 text-dim-foreground group-hover:text-accent-primary transition-colors" />
                                    <div className="text-[10px] font-black uppercase tracking-widest text-dim-foreground italic">Credit/Debit Card (Ready for Integration)</div>
                                </div>
                                <div className="w-4 h-4 rounded-full border-2 border-glass-border" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={status !== 'idle'}
                        className="w-full py-6 rounded-2xl bg-gradient-to-r from-accent-primary to-accent-secondary text-foreground font-black uppercase tracking-[0.2em] italic hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(var(--accent-rgb),0.3)] disabled:opacity-50"
                    >
                        <AnimatePresence mode="wait">
                            {status === 'idle' && (
                                <motion.span 
                                    key="idle"
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="flex items-center justify-center gap-3"
                                >
                                    Authorize Transaction
                                </motion.span>
                            )}
                            {status === 'processing' && (
                                <motion.span 
                                    key="processing"
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-center gap-3"
                                >
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Synchronizing Hub
                                </motion.span>
                            )}
                            {status === 'success' && (
                                <motion.span 
                                    key="success"
                                    initial={{ scale: 0.8, opacity: 0 }} 
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex items-center justify-center gap-3 text-emerald-400"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Protocol Established
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                    
                    <p className="text-center text-[8px] font-black uppercase tracking-[0.3em] text-dim-foreground opacity-30 italic">
                        Enterprise Grade Encryption • Powered by Stripe Architecture (Draft)
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
