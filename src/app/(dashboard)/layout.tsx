import { Sidebar } from "@/components/layout/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { SubscriptionAlert } from "@/components/dashboard/SubscriptionAlert";
import { CurrencyInitializer } from "@/components/CurrencyInitializer";
import { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from "@/config/legal";
import { TermsAuditModal } from "@/components/modals/TermsAuditModal";
import { VerificationTrigger } from "@/components/auth/VerificationTrigger";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getCurrentUser();

    if (!session) {
        redirect("/login");
    }

    const [userData, userAccount, systemAdmin] = await Promise.all([
        prisma.usuario.findUnique({
            where: { id: session.userId },
            select: { termsVersion: true, privacyVersion: true, email: true, emailVerificado: true }
        }),
        prisma.contaUsuario.findFirst({
            where: { usuarioId: session.userId, isAtivo: true, nivelAcesso: "owner" },
            include: { conta: true },
        }),
        prisma.usuarioAdmin.findUnique({
            where: { usuarioId: session.userId, isAtivo: true },
        }),
    ]);

    const status = userAccount?.conta?.stripeSubscriptionStatus || null;
    const isSystemAdmin = !!systemAdmin;
    const userPlan = userAccount?.conta?.plano;

    const needsTermsAcceptance = userData?.termsVersion !== CURRENT_TERMS_VERSION;
    const needsPrivacyAcceptance = userData?.privacyVersion !== CURRENT_PRIVACY_VERSION;
    const needsLegalUpdate = needsTermsAcceptance || needsPrivacyAcceptance;

    return (
        <div className="flex min-h-screen bg-gray-50 w-full">
            <CurrencyInitializer currencyCode={userAccount?.conta?.moedaPreferencia || 'BRL'} />
            <TermsAuditModal
                isOpen={needsLegalUpdate}
                needsTerms={needsTermsAcceptance}
                needsPrivacy={needsPrivacyAcceptance}
            />
            <VerificationTrigger
                email={userData?.email || ""}
                emailVerificado={!!userData?.emailVerificado}
            />
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
