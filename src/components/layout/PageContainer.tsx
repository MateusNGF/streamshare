import { ReactNode } from "react";

interface PageContainerProps {
    children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
    return (
        <div className="p-2 ">
            {children}
        </div>
    );
}
