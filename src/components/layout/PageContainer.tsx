import { ReactNode } from "react";


export function PageContainer({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] p-4 md:p-8 bg-gray-50/50">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>
    );
}
