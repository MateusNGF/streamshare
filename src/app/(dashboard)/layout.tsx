import { Sidebar } from "@/components/layout/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { SubscriptionAlert } from "@/components/dashboard/SubscriptionAlert";
import { CurrencyInitializer } from "@/components/CurrencyInitializer";

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

    const systemAdmin = await prisma.usuarioAdmin.findUnique({
        where: { usuarioId: session.userId, isAtivo: true },
    });

    const status = userAccount?.conta?.stripeSubscriptionStatus || null;
    const isSystemAdmin = !!systemAdmin;
    const userPlan = userAccount?.conta?.plano;

    return (
        <div className="flex min-h-screen bg-gray-50 w-full">
            <CurrencyInitializer currencyCode={userAccount?.conta?.moedaPreferencia || 'BRL'} />
            <Sidebar isSystemAdmin={isSystemAdmin} userPlan={userPlan} />
            <main className="flex-1 overflow-y-auto h-screen pt-16 lg:pt-0">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <SubscriptionAlert status={status} />
                    {children}
                </div>
            </main>
        </div>
    );
}
