"use client";
import React from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Unified SilkBot Brand Mark (UI-06 Remediation)
 * 
 * Performance Note: Uses a single semantic SVG path instead of heavy CSS browser-shaping.
 * Brand Note: Standardizes the 'Lightning Bolt' icon as the global identifier.
 */
export default function Logo({ className, iconClassName, size = "md" }: { className?: string, iconClassName?: string, size?: "sm" | "md" | "lg" | "xl" }) {
    const sizeClasses = {
        sm: "w-8 h-8 rounded-lg",
        md: "w-12 h-12 rounded-xl",
        lg: "w-14 h-14 rounded-2xl",
        xl: "w-20 h-20 rounded-[2rem]"
    };

    const iconSizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-7 h-7",
        xl: "w-10 h-10"
    };

    return (
        <div 
            className={cn(
                "bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-2xl shadow-accent-primary/20 ring-1 ring-white/10 shrink-0",
                sizeClasses[size],
                className
            )}
            role="img"
            aria-label="SilkBot Service Logo"
        >
            <Zap className={cn("fill-white/10", iconSizeClasses[size], iconClassName)} />
        </div>
    );
}
