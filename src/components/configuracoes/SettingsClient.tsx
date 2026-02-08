"use client";

import { useState } from "react";
import { Building2, User, Bell, Shield, CreditCard, LogOut, MessageSquare, DollarSign, Check, Crown, Zap, BarChart, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutModal } from "@/components/modals/LogoutModal";

import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { Input } from "@/components/ui/Input";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { Toast, ToastVariant } from "@/components/ui/Toast";
import { updateProfile, updateAccount, updateCurrency } from "@/actions/settings";
import { SUPPORTED_CURRENCIES, CurrencyCode } from "@/types/currency.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import NotificationsTab from "@/components/settings/NotificationsTab";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { PLANS } from "@/config/plans";

interface SettingsClientProps {
    initialData: {
        user: { nome: string; email: string; whatsapp?: string | null } | null;
        conta: {
            nome: string | null;
            email: string | null;
            plano: string;
            moedaPreferencia?: string;
            chavePix?: string | null;
            stripeSubscriptionStatus?: string | null;
            createdAt: Date;
            isAtivo: boolean;
            limiteGrupos: number;
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

    // Loading states separados
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingAccount, setLoadingAccount] = useState(false);
    const [loadingLogout, setLoadingLogout] = useState(false);
    const [loadingCurrency, setLoadingCurrency] = useState(false);

    // Toast state
    const [toast, setToast] = useState<ToastState | null>(null);

    // Form states
    const [profileData, setProfileData] = useState({
        nome: initialData.user?.nome || "",
        email: initialData.user?.email || "",
        whatsapp: initialData.user?.whatsapp || "",
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
        profileData.whatsapp !== (initialData.user?.whatsapp || "");

    const hasAccountChanges =
        accountData.nome !== (initialData.conta?.nome || "") ||
        accountData.email !== (initialData.conta?.email || "") ||
        accountData.chavePix !== (initialData.conta?.chavePix || "");

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

    const onUpdateCurrency = async (newCurrency: CurrencyCode) => {
        setLoadingCurrency(true);
        try {
            await updateCurrency(newCurrency);
            setCurrency(newCurrency);
            showToast("Moeda atualizada com sucesso!", "success");
        } catch (error: any) {
            const message = error?.message || "Erro ao atualizar moeda";
            showToast(message, "error");
        } finally {
            setLoadingCurrency(false);
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
                            <PhoneInput
                                label="WhatsApp"
                                value={profileData.whatsapp}
                                onChange={(value) => setProfileData({ ...profileData, whatsapp: value })}
                                placeholder="(11) 99999-9999"
                                disabled={loadingProfile}
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
                                <Input
                                    label="Chave PIX"
                                    type="text"
                                    value={accountData.chavePix}
                                    onChange={(e) => setAccountData({ ...accountData, chavePix: e.target.value })}
                                    placeholder="Ex: CPF, Email, Telefone ou Chave Aleatória"
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

                        {/* Preferências de Moeda */}
                        <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <DollarSign className="text-primary" size={24} />
                                <h2 className="text-xl font-bold text-gray-900">Preferências de Moeda</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Moeda Padrão
                                    </label>
                                    <Select value={currency} onValueChange={(value) => onUpdateCurrency(value as CurrencyCode)} disabled={loadingCurrency}>
                                        <SelectTrigger className="w-full h-auto py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{SUPPORTED_CURRENCIES[currency].symbol}</span>
                                                <div className="text-left">
                                                    <p className="text-sm font-semibold text-gray-900">{SUPPORTED_CURRENCIES[currency].name}</p>
                                                    <p className="text-xs text-gray-500">{SUPPORTED_CURRENCIES[currency].code}</p>
                                                </div>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                                                <SelectItem key={code} value={code}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{info.symbol}</span>
                                                        <div className="text-left">
                                                            <span className="block text-sm font-semibold text-gray-900">
                                                                {info.name}
                                                            </span>
                                                            <span className="text-xs text-gray-500">{info.code}</span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Esta moeda será usada para exibir todos os valores no sistema.
                                </p>
                            </div>
                        </section>
                    </div>


                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Plano Atual */}
                        <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden relative">
                            {(() => {
                                const currentPlanKey = (initialData.conta?.plano || "basico") as keyof typeof PLANS;
                                const planDetails = PLANS[currentPlanKey];
                                const isPro = currentPlanKey === "pro";
                                const usage = initialData.conta?._count || { grupos: 0, streamings: 0, participantes: 0 };
                                const limitGroups = initialData.conta?.limiteGrupos || 5;
                                const usagePercent = (usage.grupos / limitGroups) * 100;
                                const isActive = initialData.conta?.isAtivo;

                                return (
                                    <>
                                        {/* Header */}
                                        <div className={`p-8 ${isPro ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-gray-50 text-gray-900 border-b border-gray-100'}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl ${isPro ? 'bg-white/20 backdrop-blur-sm' : 'bg-white border border-gray-200'}`}>
                                                        {isPro ? <Crown size={28} className="text-yellow-300" /> : <User size={28} className="text-gray-500" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h2 className="text-xl font-bold">Plano {planDetails.label}</h2>
                                                            {isPro && <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-200 text-[10px] font-bold uppercase tracking-wider rounded-full border border-yellow-400/30">PRO</span>}
                                                        </div>
                                                        <div className={`flex items-center gap-2 text-sm mt-1 ${isPro ? 'text-indigo-100' : 'text-gray-500'}`}>
                                                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                                                            {isActive ? 'Assinatura Ativa' : 'Assinatura Inativa'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-8 space-y-8">
                                            {/* Usage Stats */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 flex items-center gap-2 font-medium">
                                                        <Building2 size={16} /> Grupos Criados
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        {usage.grupos} <span className="text-gray-400 font-normal">/ {limitGroups === 9999 ? '∞' : limitGroups}</span>
                                                    </span>
                                                </div>
                                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isPro ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-primary'}`}
                                                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                    />
                                                </div>
                                                {usagePercent >= 80 && limitGroups < 9999 && (
                                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                                        <Zap size={12} /> Você está próximo do limite do seu plano.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Features Preview */}
                                            <div className="space-y-3">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Incluso no plano</p>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {planDetails.features.slice(0, 4).map((feature, idx) => (
                                                        <div key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                                            <div className={`mt-0.5 p-0.5 rounded-full ${isPro ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                                                                <Check size={12} strokeWidth={3} />
                                                            </div>
                                                            <span className="leading-tight">{feature.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => router.push("/planos")}
                                                    className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group
                                                    ${isPro
                                                            ? 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                                                            : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5'
                                                        }`}
                                                >
                                                    {isPro ? (
                                                        'Gerenciar Assinatura'
                                                    ) : (
                                                        <>
                                                            <Crown size={18} className="text-yellow-300" />
                                                            <span className="group-hover:tracking-wide transition-all">Fazer Upgrade para PRO</span>
                                                        </>
                                                    )}
                                                </button>
                                                {initialData.conta?.createdAt && (
                                                    <p className="text-center text-xs text-gray-400 mt-4">
                                                        Membro desde {new Date(initialData.conta.createdAt).toLocaleDateString('pt-BR')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </section>
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
