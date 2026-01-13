import { Building2, User, Bell, Shield, CreditCard, LogOut } from "lucide-react";

export default function ConfiguracoesPage() {
    return (
        <div className="p-8 pb-12">
            {/* Header */}
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                <p className="text-gray-500 font-medium">Gerencie as configurações da sua conta</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Account Info */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Building2 className="text-primary" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Informações da Conta</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome da Conta
                                </label>
                                <input
                                    type="text"
                                    defaultValue="StreamShare Pro"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    defaultValue="contato@streamshare.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div className="pt-4">
                                <button className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-xl font-bold transition-all">
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="text-primary" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Perfil do Usuário</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Carlos Silva"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cargo
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Administrador"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                    </section>

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
                            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                <div>
                                    <p className="font-semibold text-gray-900">Novos Participantes</p>
                                    <p className="text-sm text-gray-500">Notificar sobre novos cadastros</p>
                                </div>
                                <input type="checkbox" className="w-5 h-5 text-primary" />
                            </label>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="text-primary" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Plano Atual</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Plano</p>
                                <p className="text-2xl font-bold text-primary">Pro</p>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Limite de Grupos</span>
                                    <span className="font-semibold text-gray-900">10</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Streamings</span>
                                    <span className="font-semibold text-gray-900">Ilimitado</span>
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
                            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                                <p className="font-semibold text-gray-900">Alterar Senha</p>
                            </button>
                            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                                <p className="font-semibold text-gray-900">Autenticação 2FA</p>
                            </button>
                        </div>
                    </section>

                    <button className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-2xl font-bold transition-all">
                        <LogOut size={20} />
                        Sair da Conta
                    </button>
                </div>
            </div>
        </div>
    );
}
