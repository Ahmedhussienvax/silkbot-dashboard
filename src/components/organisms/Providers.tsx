"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <MotionConfig transition={{ type: "spring", damping: 20, stiffness: 100 }}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="bottom-right" richColors theme="dark" />
        </QueryClientProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}