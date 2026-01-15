import { Sidebar } from "@/components/layout/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
