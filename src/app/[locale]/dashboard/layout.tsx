import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import NavigationSidebar from "@/components/organisms/NavigationSidebar";
import MobileHeader from "@/components/organisms/MobileHeader";
import { getTranslations } from 'next-intl/server';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // if (!user) redirect("/login");

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-accent-primary/30">
            {/* Sidebar Integration */}
            <NavigationSidebar />
            <div className="flex-1 flex flex-col min-h-screen">
                <MobileHeader />
                <div className="flex-1 pt-20 lg:pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
