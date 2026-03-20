import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Cairo } from "next/font/google";
import { Toaster } from 'sonner';
import Providers from "@/components/Providers";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });
const cairo = Cairo({ subsets: ["arabic"] });

export const metadata = {
    title: "SilkBot | Dashboard",
    description: "Next-gen WhatsApp AI automation.",
};

import { ErrorBoundary } from '@/components/ErrorBoundary';

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
        <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>
            <body className={`${isRtl ? cairo.className : inter.className} bg-slate-950 text-white antialiased`}>
                <NextIntlClientProvider messages={messages}>
                    <ErrorBoundary>
                        <Providers>
                            {children}
                        </Providers>
                    </ErrorBoundary>
                    <Toaster richColors position="top-center" expand={true} />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
