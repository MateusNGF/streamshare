"use client";

import { User, LogOut, Shield } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { SectionHeader } from "@/components/layout/SectionHeader";

interface ProfileTabProps {
    profileData: {
        nome: string;
        email: string;
        whatsapp: string;
    };
    setProfileData: (data: any) => void;
    onUpdateProfile: (e: React.FormEvent) => void;
    loadingProfile: boolean;
    hasProfileChanges: boolean;
    setIsChangePasswordModalOpen: (open: boolean) => void;
    handleRemoteLogout: () => void;
    loadingRemoteLogout: boolean;
    setIsLogoutModalOpen: (open: boolean) => void;
}

export function ProfileTab({
    profileData,
    setProfileData,
    onUpdateProfile,
    loadingProfile,
    hasProfileChanges,
    setIsChangePasswordModalOpen,
    handleRemoteLogout,
    loadingRemoteLogout,
    setIsLogoutModalOpen
}: ProfileTabProps) {
    return (
        <div className="space-y-16">
            {/* Perfil do Usuário */}
            <section>
                <SectionHeader
                    title="Dados Pessoais"
                    description="Mantenha suas informações de contato atualizadas"
                />
                <form onSubmit={onUpdateProfile} className="space-y-6 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nome de Exibição"
                            type="text"
                            value={profileData.nome}
                            onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                            required
                            minLength={3}
                            disabled={loadingProfile}
                            placeholder="Seu nome completo"
                        />
                        <Input
                            label="Email de Login"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            disabled
                            className="bg-gray-50/50 cursor-not-allowed border-gray-100"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PhoneInput
                            label="WhatsApp"
                            value={profileData.whatsapp}
                            onChange={(value) => setProfileData({ ...profileData, whatsapp: value })}
                            placeholder="(11) 99999-9999"
                            disabled={loadingProfile}
                        />
                        <div className="flex items-end pb-1">
                            <p className="text-xs text-gray-400 italic">
                                * O email de login não pode ser alterado por segurança.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-start">
                        <button
                            type="submit"
                            disabled={loadingProfile || !hasProfileChanges}
                            className={`
                                min-w-[200px] h-14 rounded-2xl font-bold transition-all
                                shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20
                                ${hasProfileChanges
                                    ? "bg-primary text-white hover:scale-[1.02] active:scale-95"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"}
                            `}
                        >
                            {loadingProfile
                                ? "Processando..."
                                : hasProfileChanges
                                    ? "Salvar Alterações ✓"
                                    : "Dados Atualizados"}
                        </button>
                    </div>
                </form>
            </section>

            {/* Segurança */}
            <section>
                <SectionHeader
                    title="Segurança e Acesso"
                    description="Gerencie métodos de autenticação e sessões ativas"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <button
                        onClick={() => setIsChangePasswordModalOpen(true)}
                        className="flex flex-col items-start p-6 border border-gray-100 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all text-left group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                            <Shield className="text-gray-400 group-hover:text-primary transition-colors" size={20} />
                        </div>
                        <p className="font-bold text-gray-900 mb-1">Alterar Senha</p>
                        <p className="text-xs text-gray-500 leading-relaxed">Modifique sua credencial de acesso periodicamente.</p>
                    </button>

                    <button className="flex flex-col items-start p-6 border border-gray-100 rounded-3xl opacity-50 cursor-not-allowed text-left">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                            <Shield size={20} className="text-gray-400" />
                        </div>
                        <p className="font-bold text-gray-900 mb-1">Autenticação 2FA</p>
                        <p className="text-xs text-gray-500 leading-relaxed">Camada extra de segurança disponível em breve.</p>
                    </button>

                    <button
                        onClick={handleRemoteLogout}
                        disabled={loadingRemoteLogout}
                        className="flex flex-col items-start p-6 border border-red-50 rounded-3xl hover:bg-red-50/30 transition-all text-left group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                            <LogOut className="text-red-400 group-hover:text-red-500 transition-colors" size={20} />
                        </div>
                        <p className="font-bold text-gray-900 mb-1 group-hover:text-red-700">Logout Remoto</p>
                        <p className="text-xs text-gray-500 leading-relaxed group-hover:text-red-600">
                            {loadingRemoteLogout ? "Saindo..." : "Desconectar de todos os outros dispositivos."}
                        </p>
                    </button>
                </div>
            </section>

            {/* Logout Local - Mais discreto */}
            <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
                <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sessão Atual</h4>
                    <p className="text-xs text-gray-500 mt-1">Este dispositivo está autenticado.</p>
                </div>
                <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-6 py-3 rounded-2xl transition-all"
                >
                    <LogOut size={18} />
                    Encerrar Sessão
                </button>
            </div>
        </div>
    );
}
