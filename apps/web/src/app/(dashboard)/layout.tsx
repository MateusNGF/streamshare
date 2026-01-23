import { Sidebar } from "@/components/layout/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@streamshare/database";
import { redirect } from "next/navigation";
import { SubscriptionAlert } from "@/components/dashboard/SubscriptionAlert";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getCurrentUser();

    if (!session) {
        redirect("/login");
    }

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true, nivelAcesso: "owner" },
        include: { conta: true },
    });

    const status = userAccount?.conta?.stripeSubscriptionStatus || null;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto">
                    <SubscriptionAlert status={status} />
                    {children}
                </div>
            </main>
        </div>
    );
}
