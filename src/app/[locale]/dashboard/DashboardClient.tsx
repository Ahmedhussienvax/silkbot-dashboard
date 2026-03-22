"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import OnboardingWizard from "@/components/organisms/OnboardingWizard";

interface DashboardClientProps {
    children: React.ReactNode;
}

export default function DashboardClient({ children }: DashboardClientProps) {
    const [showWizard, setShowWizard] = useState(false);

    return (
        <>
            {children}
            <OnboardingWizard 
                show={showWizard} 
                onComplete={() => setShowWizard(false)} 
            />
        </>
    );
}
