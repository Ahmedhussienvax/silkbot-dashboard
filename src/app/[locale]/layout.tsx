import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Outfit, Cairo } from "next/font/google";
import { Toaster } from 'sonner';
import Providers from "@/components/organisms/Providers";
import { ErrorBoundary } from '@/components/molecules/ErrorBoundary';
import "../globals.css";

const outfit = Outfit({ subsets: ["latin"] });
const cairo = Cairo({ subsets: ["arabic"] });

export const metadata = {
    title: "SilkBot | Dashboard",
    description: "Next-gen WhatsApp AI automation.",
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const messages = await getMessages();
    const isRtl = locale === 'ar';

    return (
        <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning className="dark">
            <head>
                {/* Critical CSS for zero-latency initial paint */}
                <style dangerouslySetInnerHTML={{ __html: `
                    :root { color-scheme: dark; }
                    body { background-color: #030410; margin: 0; padding: 0; }
                    /* Prevent flash of content during hydration */
                    [data-js-focus-visible] :focus:not([data-focus-visible-added]) { outline: none; }
                `}} />
            </head>
            <body className={`${isRtl ? cairo.className : outfit.className} antialiased selection:bg-indigo-500/30`}>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <ErrorBoundary>
                        <Providers>
                            <main className="min-h-screen bg-[#030410]">
                                {children}
                            </main>
                        </Providers>
                    </ErrorBoundary>
                    <Toaster richColors position="top-center" expand={false} visibleToasts={1} closeButton />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
