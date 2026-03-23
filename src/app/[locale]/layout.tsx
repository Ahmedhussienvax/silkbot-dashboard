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
        <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
            <body className={`${isRtl ? cairo.className : outfit.className} antialiased`}>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <ErrorBoundary>
                        <Providers>
                            {children}
                        </Providers>
                    </ErrorBoundary>
                    <Toaster richColors position="top-center" expand={false} visibleToasts={1} closeButton />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
