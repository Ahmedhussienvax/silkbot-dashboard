import { Variants } from "framer-motion";

export const premiumEntrance: Variants = {
    initial: { opacity: 0, y: 40 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: { 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1] 
        }
    }
};

export const hoverLift: Variants = {
    hover: { 
        scale: 1.02, 
        y: -4,
        transition: { 
            type: "spring", 
            stiffness: 400, 
            damping: 10 
        }
    },
    tap: { 
        scale: 0.98,
        transition: { 
            type: "spring", 
            stiffness: 400, 
            damping: 10 
        }
    }
};

export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

export const staggerItem: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
        opacity: 1, 
        x: 0,
        transition: { 
            type: "spring", 
            stiffness: 100, 
            damping: 20 
        }
    }
};

export const glowPulse: Variants = {
    animate: {
        boxShadow: [
            "0 0 0px 0px rgba(139, 92, 246, 0.1)",
            "0 0 20px 4px rgba(139, 92, 246, 0.3)",
            "0 0 0px 0px rgba(139, 92, 246, 0.1)"
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

export const shake: Variants = {
    animate: {
        x: [0, -4, 4, -4, 4, 0],
        transition: { duration: 0.4, ease: "easeInOut" }
    }
};

export const bounce: Variants = {
    animate: {
        y: [0, -8, 0],
        transition: { type: "spring", stiffness: 300, damping: 10 }
    }
};
