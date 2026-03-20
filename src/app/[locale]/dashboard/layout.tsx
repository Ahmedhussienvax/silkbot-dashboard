import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <Sidebar userEmail={user.email || ""} />
            {/* Main Content — add left padding on mobile for hamburger button */}
            <main className="flex-1 overflow-auto md:ml-0">
                {children}
            </main>
        </div>
    );
}
