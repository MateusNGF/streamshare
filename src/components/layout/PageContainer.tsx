import { ReactNode } from "react";


export function PageContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 pb-32 bg-gray-50/50">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
}
