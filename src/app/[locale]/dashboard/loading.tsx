export default function DashboardLoading() {
    return (
        <div className="p-10 space-y-12 animate-pulse">
            <div className="h-12 w-64 bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-40 bg-white/5 rounded-3xl" />
                ))}
            </div>
            <div className="h-[400px] w-full bg-white/5 rounded-[2.5rem]" />
        </div>
    );
}
