import { ReactNode } from "react";

interface PageContainerProps {
    children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
    return (
        <div className="p-4 md:p-8 pb-8 md:pb-12 pt-20 lg:pt-8">
            {children}
        </div>
    );
}
