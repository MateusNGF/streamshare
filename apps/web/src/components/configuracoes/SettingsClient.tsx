"use client";

import { useState } from "react";
import { Building2, User, Bell, Shield, CreditCard, LogOut, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutModal } from "@/components/modals/LogoutModal";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { Input } from "@/components/ui/Input";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { updateProfile, updateAccount } from "@/actions/settings";

interface SettingsClientProps {
    initialData: {
        user: { nome: string; email: string } | null;
        conta: { nome: string | null; email: string | null; plano: string } | null | any;
    };
}

export function SettingsClient({ initialData }: SettingsClientProps) {
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    // Form states
    const [profileData, setProfileData] = useState({
        nome: initialData.user?.nome || "",
        email: initialData.user?.email || "",
    });

    const [accountData, setAccountData] = useState({
        nome: initialData.conta?.nome || "",
        email: initialData.conta?.email || "",
    });

    const handleLogout = async () => {
        setLoading(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setLoading(false);
            setIsLogoutModalOpen(false);
        }
    };

    const onUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(profileData);
            showSuccess("Perfil atualizado com sucesso!");
        } catch (error) {
            alert("Erro ao atualizar perfil.");
        } finally {
            setLoading(false);
        }
    };

    const onUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateAccount(accountData);
            showSuccess("Informações da conta atualizadas!");
        } catch (error) {
            alert("Erro ao atualizar conta.");
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (msg: string) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Configurações"
                description="Gerencie as configurações da sua conta"
                action={
                    success && (
                        <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <Check size={18} />
                            <span className="font-bold text-sm md:text-base">{success}</span>
                        </div>
                    )
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Account Info */}
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
                            />
                            <Input
                                label="Email de Contato"
                                type="email"
                                value={accountData.email}
                                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                                placeholder="Ex: financeiro@email.com"
                            />
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    {loading ? "Salvando..." : "Salvar Alterações"}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* User Profile */}
                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="text-primary" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Perfil do Usuário</h2>
                        </div>
                        <form onSubmit={onUpdateProfile} className="space-y-4">
                            <Input
                                label="Nome"
                                type="text"
                                value={profileData.nome}
                                onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                                required
                            />
                            <Input
                                label="Email de Login"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                disabled
                                className="bg-gray-50 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">* O email de login não pode ser alterado por segurança.</p>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    {loading ? "Salvando..." : "Atualizar Perfil"}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Notifications Placeholder */}
                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="text-primary" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Notificações</h2>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                <div>
                                    <p className="font-semibold text-gray-900">Pagamentos Recebidos</p>
                                    <p className="text-sm text-gray-500">Notificar quando receber um pagamento</p>
                                </div>
                                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
                            </label>
                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                <div>
                                    <p className="font-semibold text-gray-900">Pagamentos Atrasados</p>
                                    <p className="text-sm text-gray-500">Alertar sobre pagamentos em atraso</p>
                                </div>
                                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
                            </label>
                        </div>
                    </section>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
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
                            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold transition-all mt-4">
                                Alterar Plano
                            </button>
                        </div>
                    </section>

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
                            </button>
                            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                                <p className="font-semibold text-gray-900">Autenticação 2FA</p>
                            </button>
                        </div>
                    </section>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-2xl font-bold transition-all mt-2"
                    >
                        <LogOut size={20} />
                        Sair da Conta
                    </button>
                </div>
            </div>

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                loading={loading}
            />

            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSuccess={() => showSuccess("Senha alterada com sucesso!")}
            />
        </PageContainer>
    );
}
