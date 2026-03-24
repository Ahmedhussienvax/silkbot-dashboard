"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CreditCard, X, Zap } from "lucide-react";
import { useRouter } from "@/i18n/routing";

interface QuotaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function QuotaModal({ isOpen, onClose }: QuotaModalProps) {
    const router = useRouter();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg glass-card p-10 bg-background overflow-hidden"
                    >
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px] -z-10" />
                        
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface text-muted-foreground flex items-center justify-center hover:bg-foreground/10 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none">
                                    Subscription <span className="text-red-500">Locked</span>
                                </h2>
                                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest italic pt-1">
                                    AI Usage Limit Reached
                                </p>
                            </div>

                            <p className="text-muted-foreground text-sm leading-relaxed px-4">
                                Your current operational sector has exhausted its allocated tokens. Upgrading your neural node will restore real-time automation and intelligence.
                            </p>

                            <div className="grid grid-cols-1 gap-4 pt-4">
                                <button 
                                    onClick={() => {
                                        router.push("/dashboard/settings");
                                        onClose();
                                    }}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-accent-primary text-foreground rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-accent-primary/20 hover:scale-[1.02] transition-all"
                                >
                                    <Zap className="w-5 h-5 fill-white" />
                                    Expand Architecture
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="w-full py-4 bg-surface text-muted-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-foreground/10 transition-all border border-border"
                                >
                                    Dismiss Protocol
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
