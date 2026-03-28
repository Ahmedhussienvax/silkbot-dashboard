import React from 'react';

export default function LoginLoading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 animate-pulse">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-surface rounded-3xl" />
                    <div className="h-8 w-48 bg-surface rounded-xl" />
                </div>
                
                <div className="grid grid-cols-1 gap-4 mt-12">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 w-full bg-surface rounded-2xl border border-border/50" />
                    ))}
                </div>

                <div className="flex justify-center pt-6">
                    <div className="h-4 w-32 bg-surface rounded-md" />
                </div>
            </div>
        </div>
    );
}
