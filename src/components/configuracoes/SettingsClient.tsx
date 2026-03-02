"use client";

import { useState } from "react";
import { Building2, User, Bell, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { Toast, ToastVariant } from "@/components/ui/Toast";
import { updateProfile, updateAccount, updateCurrency } from "@/actions/settings";
import { CurrencyCode } from "@/types/currency.types";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

const ProfileTab = dynamic(() => import("./ProfileTab").then(mod => mod.ProfileTab), {
    loading: () => <Skeleton className="w-full h-[400px] rounded-[32px]" />
});
const AccountTab = dynamic(() => import("./AccountTab").then(mod => mod.AccountTab), {
    loading: () => <Skeleton className="w-full h-[400px] rounded-[32px]" />
});

const EmailVerificationModal = dynamic(() => import("@/components/auth/EmailVerificationModal").then(mod => mod.EmailVerificationModal));
const SocialAccountsTab = dynamic(() => import("./SocialAccountsTab").then(mod => mod.SocialAccountsTab), {
    loading: () => <Skeleton className="w-full h-[300px] rounded-[32px]" />
});
const NotificationsTab = dynamic(() => import("@/components/settings/NotificationsTab"), {
    loading: () => <Skeleton className="w-full h-[400px] rounded-[32px]" />
});

const LogoutModal = dynamic(() => import("@/components/modals/LogoutModal").then(mod => mod.LogoutModal));
const ChangePasswordModal = dynamic(() => import("@/components/modals/ChangePasswordModal").then(mod => mod.ChangePasswordModal));

interface SettingsClientProps {
    initialData: {
        user: {
            nome: string;
            email: string;
            whatsapp?: string | null;
            whatsappNumero?: string | null;
            whatsappVerificado?: boolean;
            emailVerificado: boolean;
            provider?: string;
            hasPassword?: boolean;
        } | null;
        conta: {
            nome: string | null;
            email: string | null;
            plano: string;
            moedaPreferencia?: string;
            chavePix?: string | null;
            stripeSubscriptionStatus?: string | null;
            createdAt: Date;
            isAtivo: boolean;

            _count?: {
                grupos: number;
                streamings: number;
                participantes: number;
            };
        } | null | any;
    };
}

interface ToastState {
    message: string;
    variant: ToastVariant;
}

export function SettingsClient({ initialData }: SettingsClientProps) {
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    // Loading states
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingAccount, setLoadingAccount] = useState(false);
    const [loadingLogout, setLoadingLogout] = useState(false);
    const [loadingRemoteLogout, setLoadingRemoteLogout] = useState(false);
    const [loadingCurrency, setLoadingCurrency] = useState(false);

    // Toast state
    const [toast, setToast] = useState<ToastState | null>(null);

    // Form states
    const [profileData, setProfileData] = useState({
        nome: initialData.user?.nome || "",
        email: initialData.user?.email || "",
        whatsapp: initialData.user?.whatsappNumero || initialData.user?.whatsapp || "",
    });

    const [accountData, setAccountData] = useState({
        nome: initialData.conta?.nome || "",
        email: initialData.conta?.email || "",
        chavePix: initialData.conta?.chavePix || "",
    });

    const [currency, setCurrency] = useState<CurrencyCode>(
        (initialData.conta?.moedaPreferencia as CurrencyCode) || 'BRL'
    );

    // Detectar alterações pendentes
    const hasProfileChanges =
        profileData.nome !== initialData.user?.nome ||
        profileData.whatsapp !== (initialData.user?.whatsappNumero || initialData.user?.whatsapp || "");

    const hasAccountChanges =
        accountData.nome !== (initialData.conta?.nome || "") ||
        accountData.email !== (initialData.conta?.email || "") ||
        accountData.chavePix !== (initialData.conta?.chavePix || "");

    // Validação de email
    const validateEmail = (email: string): string | null => {
        if (!email) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "Formato de email inválido";
        }
        return null;
    };

    const showToast = (message: string, variant: ToastVariant = "success") => {
        setToast({ message, variant });
    };

    const handleRemoteLogout = async () => {
        if (!confirm("Isso desconectará você de TODOS os dispositivos, incluindo este. Deseja continuar?")) {
            return;
        }

        setLoadingRemoteLogout(true);
        try {
            await fetch("/api/auth/logout-remote", { method: "POST" });
            await fetch("/api/auth/logout", { method: "POST" });

            showToast("Desconectado de todos os dispositivos.", "success");
            router.push("/login?reason=session_expired");
            router.refresh();
        } catch (error) {
            showToast("Erro ao desconectar sessões", "error");
        } finally {
            setLoadingRemoteLogout(false);
        }
    };

    const handleLogout = async () => {
        setLoadingLogout(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            showToast("Erro ao fazer logout", "error");
        } finally {
            setLoadingLogout(false);
            setIsLogoutModalOpen(false);
        }
    };

    const onUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingProfile(true);
        try {
            const result = await updateProfile(profileData);
            if (result.success) {
                showToast("Perfil atualizado com sucesso!", "success");
            } else if (result.error) {
                showToast(result.error, "error");
            }
        } catch (error: any) {
            const message = error?.message || "Erro ao atualizar perfil";
            showToast(message, "error");
        } finally {
            setLoadingProfile(false);
        }
    };

    const onUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (accountData.email) {
            const emailError = validateEmail(accountData.email);
            if (emailError) {
                showToast(emailError, "error");
                return;
            }
        }

        setLoadingAccount(true);
        try {
            const result = await updateAccount(accountData);
            if (result.success) {
                showToast("Informações da conta atualizadas!", "success");
            } else if (result.error) {
                showToast(result.error, "error");
            }
        } catch (error: any) {
            const message = error?.message || "Erro ao atualizar conta";
            showToast(message, "error");
        } finally {
            setLoadingAccount(false);
        }
    };

    const onUpdateCurrency = async (newCurrency: CurrencyCode) => {
        setLoadingCurrency(true);
        try {
            const result = await updateCurrency(newCurrency);
            if (result.success) {
                setCurrency(newCurrency);
                showToast("Moeda atualizada com sucesso!", "success");
            } else if (result.error) {
                showToast(result.error, "error");
            }
        } catch (error: any) {
            const message = error?.message || "Erro ao atualizar moeda";
            showToast(message, "error");
        } finally {
            setLoadingCurrency(false);
        }
    };

    const tabsData: TabItem[] = [
        {
            id: "perfil",
            label: "Meu Perfil",
            icon: User,
            content: (
                <ProfileTab
                    profileData={profileData}
                    setProfileData={setProfileData}
                    onUpdateProfile={onUpdateProfile}
                    loadingProfile={loadingProfile}
                    hasProfileChanges={hasProfileChanges}
                    setIsChangePasswordModalOpen={setIsChangePasswordModalOpen}
                    handleRemoteLogout={handleRemoteLogout}
                    loadingRemoteLogout={loadingRemoteLogout}
                    setIsLogoutModalOpen={setIsLogoutModalOpen}
                    emailVerificado={initialData.user?.emailVerificado || false}
                />
            )
        },
        {
            id: "conta",
            label: "Conta",
            icon: Building2,
            content: (
                <AccountTab
                    accountData={accountData}
                    setAccountData={setAccountData}
                    onUpdateAccount={onUpdateAccount}
                    loadingAccount={loadingAccount}
                    hasAccountChanges={hasAccountChanges}
                    currency={currency}
                    onUpdateCurrency={onUpdateCurrency}
                    loadingCurrency={loadingCurrency}
                    conta={initialData.conta}
                    showToast={showToast}
                />
            )
        },
        {
            id: "social",
            label: "Contas Sociais",
            icon: Share2,
            content: <SocialAccountsTab user={initialData.user as any} />,
        },
        {
            id: "notificacoes",
            label: "Notificações",
            icon: Bell,
            content: <NotificationsTab />,
        },
    ];

    return (
        <PageContainer>
            <PageHeader
                title="Configurações"
                description="Gerencie as configurações da sua conta e perfil"
            />

            <Tabs tabs={tabsData} defaultTab="perfil" />

            {toast && (
                <Toast
                    message={toast.message}
                    variant={toast.variant}
                    onClose={() => setToast(null)}
                />
            )}

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                loading={loadingLogout}
            />

            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                user={initialData.user}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSuccess={() => showToast("Senha alterada com sucesso!", "success")}
            />

        </PageContainer>
    );
}
