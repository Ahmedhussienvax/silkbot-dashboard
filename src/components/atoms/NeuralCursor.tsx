"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NeuralCursor() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isPointer, setIsPointer] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);

            const target = e.target as HTMLElement;
            const computedStyle = window.getComputedStyle(target);
            setIsPointer(
                computedStyle.cursor === 'pointer' || 
                target.tagName === 'BUTTON' || 
                target.tagName === 'A' ||
                target.closest('button') !== null ||
                target.closest('a') !== null
            );
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference"
                    animate={{
                        x: mousePos.x - 16,
                        y: mousePos.y - 16,
                        scale: isPointer ? 1.5 : 1,
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 400, mass: 0.5 }}
                >
                    {/* Ring */}
                    <motion.div 
                        className="absolute inset-0 border-2 border-accent-primary rounded-full opacity-40"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Dot */}
                    <div className="w-1.5 h-1.5 bg-accent-primary rounded-full shadow-[0_0_15px_rgba(var(--accent-rgb),0.8)]" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
