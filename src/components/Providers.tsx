"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
                retry: (failureCount, error: any) => {
                    // Self-healing: Retry more aggressively on network errors
                    if (error?.message?.includes("network") || error?.status === 503) {
                        return failureCount < 5;
                    }
                    return failureCount < 2;
                },
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <Toaster 
                position="top-center" 
                richColors 
                closeButton
                theme="dark"
                toastOptions={{
                    style: {
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '1.25rem',
                        color: '#fff',
                    },
                }}
            />
            {children}
        </QueryClientProvider>
    );
}