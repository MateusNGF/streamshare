"use client";

import { useState } from "react";
import { Building2, User, Bell, Shield, CreditCard, LogOut, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutModal } from "@/components/modals/LogoutModal";

import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { Input } from "@/components/ui/Input";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { Toast, ToastVariant } from "@/components/ui/Toast";
import { updateProfile, updateAccount } from "@/actions/settings";
import NotificationsTab from "@/components/settings/NotificationsTab";

interface SettingsClientProps {
    initialData: {
        user: { nome: string; email: string } | null;
        conta: { nome: string | null; email: string | null; plano: string } | null | any;
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

    // Loading states separados
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingAccount, setLoadingAccount] = useState(false);
    const [loadingLogout, setLoadingLogout] = useState(false);

    // Toast state
    const [toast, setToast] = useState<ToastState | null>(null);

    // Form states
    const [profileData, setProfileData] = useState({
        nome: initialData.user?.nome || "",
        email: initialData.user?.email || "",
    });

    const [accountData, setAccountData] = useState({
        nome: initialData.conta?.nome || "",
        email: initialData.conta?.email || "",
    });

    // Detectar alterações pendentes
    const hasProfileChanges =
        profileData.nome !== initialData.user?.nome;

    const hasAccountChanges =
        accountData.nome !== (initialData.conta?.nome || "") ||
        accountData.email !== (initialData.conta?.email || "");

    // Validação de email no frontend
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
            await updateProfile(profileData);
            showToast("Perfil atualizado com sucesso!", "success");
        } catch (error: any) {
            const message = error?.message || "Erro ao atualizar perfil";
            showToast(message, "error");
        } finally {
            setLoadingProfile(false);
        }
    };

    const onUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação frontend
        if (accountData.email) {
            const emailError = validateEmail(accountData.email);
            if (emailError) {
                showToast(emailError, "error");
                return;
            }
        }

        setLoadingAccount(true);
        try {
            await updateAccount(accountData);
            showToast("Informações da conta atualizadas!", "success");
        } catch (error: any) {
            const message = error?.message || "Erro ao atualizar conta";
            showToast(message, "error");
        } finally {
            setLoadingAccount(false);
        }
    };

    // Conteúdo das tabs
    const tabsData: TabItem[] = [
        {
            id: "perfil",
            label: "Meu Perfil",
            icon: User,
            content: (
                <div className="space-y-6">
                    {/* Perfil do Usuário */}
                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="text-primary" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Dados Pessoais</h2>
                        </div>
                        <form onSubmit={onUpdateProfile} className="space-y-4">
                            <Input
                                label="Nome"
                                type="text"
                                value={profileData.nome}
                                onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                                required
                                minLength={3}
                                disabled={loadingProfile}
                            />
                            <Input
                                label="Email de Login"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                disabled
                                className="bg-gray-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                * O email de login não pode ser alterado por segurança.
                            </p>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loadingProfile || !hasProfileChanges}
                                    className={`
                                        ${hasProfileChanges ? "bg-accent" : "bg-primary"}
                                        hover:bg-accent text-white px-6 py-3 rounded-2xl 
                                        font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                >
                                    {loadingProfile
                                        ? "Salvando..."
                                        : hasProfileChanges
                                            ? "Salvar Alterações ✓"
                                            : "Atualizar Perfil"}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Segurança */}
                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="text-primary" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Segurança</h2>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsChangePasswordModalOpen(true)}
                                className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                            >
                                <p className="font-semibold text-gray-900">Alterar Senha</p>
                                <p className="text-sm text-gray-500">Modifique sua senha de acesso</p>
                            </button>
                            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all opacity-50 cursor-not-allowed">
                                <p className="font-semibold text-gray-900">Autenticação 2FA</p>
                                <p className="text-sm text-gray-500">Em breve</p>
                            </button>
                        </div>
                    </section>

                    {/* Logout */}
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-2xl font-bold transition-all"
                    >
                        <LogOut size={20} />
                        Sair da Conta
                    </button>
                </div>
            ),
        },
        {
            id: "conta",
            label: "Conta",
            icon: Building2,
            content: (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Coluna Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informações da Conta */}
                        <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <Building2 className="text-primary" size={24} />
                                <h2 className="text-xl font-bold text-gray-900">Informações da Conta</h2>
                            </div>
                            <form onSubmit={onUpdateAccount} className="space-y-4">
                                <Input
                                    label="Nome da Conta"
                                    type="text"
                                    value={accountData.nome}
                                    onChange={(e) => setAccountData({ ...accountData, nome: e.target.value })}
                                    placeholder="Ex: Minha Família"
                                    required
                                    minLength={3}
                                    disabled={loadingAccount}
                                />
                                <Input
                                    label="Email de Contato"
                                    type="email"
                                    value={accountData.email}
                                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                                    placeholder="Ex: financeiro@email.com"
                                    disabled={loadingAccount}
                                />
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loadingAccount || !hasAccountChanges}
                                        className={`
                                            ${hasAccountChanges ? "bg-accent" : "bg-primary"}
                                            hover:bg-accent text-white px-6 py-3 rounded-2xl 
                                            font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        {loadingAccount
                                            ? "Salvando..."
                                            : hasAccountChanges
                                                ? "Salvar Alterações ✓"
                                                : "Atualizar Conta"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>


                    {/* Sidebar */}
                    < div className="space-y-6" >
                        {/* Plano Atual */}
                        < section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm" >
                            <div className="flex items-center gap-3 mb-6">
                                <CreditCard className="text-primary" size={24} />
                                <h2 className="text-xl font-bold text-gray-900">Plano Atual</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
                                    <p className="text-sm text-gray-600 mb-1">Plano Atual</p>
                                    <p className="text-2xl font-bold text-primary capitalize">
                                        {initialData.conta?.plano || "basico"}
                                    </p>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Limite de Grupos</span>
                                        <span className="font-semibold text-gray-900">
                                            {initialData.conta?.limiteGrupos || 5}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Participantes</span>
                                        <span className="font-semibold text-gray-900">Ilimitado</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push("/planos")}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-2xl font-bold transition-all mt-4"
                                >
                                    Alterar Plano
                                </button>
                            </div>
                        </section >
                    </div >
                </div >
            ),
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

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    variant={toast.variant}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Modals */}
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                loading={loadingLogout}
            />

            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSuccess={() => showToast("Senha alterada com sucesso!", "success")}
            />
        </PageContainer>
    );
}
