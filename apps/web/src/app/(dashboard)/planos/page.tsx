import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlansClient } from "@/components/planos/PlansClient";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@streamshare/database";
import { redirect } from "next/navigation";

export default async function PlanosPage() {
    const session = await getCurrentUser();

    if (!session) {
        redirect("/login");
    }

    const userAccount = await prisma.contaUsuario.findFirst({
        where: { usuarioId: session.userId, isAtivo: true, nivelAcesso: "owner" },
        include: { conta: true },
    });

    if (!userAccount) {
        // Handle edge case (no account) or redirect to setup
        return <div>Conta não encontrada.</div>;
    }

    return (
        <PageContainer>
            <PageHeader
                title="Meus Planos"
                description="Gerencie sua assinatura e escolha o melhor plano para você."
            />
            <PlansClient
                currentPlan={userAccount.conta.plano}
                isLoggedIn={true}
                showHeader={false}
            />
        </PageContainer>
    );
}
