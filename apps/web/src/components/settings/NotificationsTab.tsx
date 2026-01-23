"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Mail, Bell, ShieldCheck } from "lucide-react";
import { getWhatsAppConfig, saveWhatsAppConfig } from "@/actions/whatsapp";

export default function NotificationsTab() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        try {
            const data = await getWhatsAppConfig();
            setConfig(data || {
                notificarNovaAssinatura: true,
                notificarCobrancaGerada: true,
                notificarCobrancaVencendo: true,
                notificarCobrancaAtrasada: true,
                notificarAssinaturaSuspensa: true,
                notificarPagamentoConfirmado: true,
                diasAvisoVencimento: 3,
                isAtivo: true,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        setMessage("");
        try {
            await saveWhatsAppConfig(config);
            setMessage("✓ Configurações salvas com sucesso!");
            await loadConfig();
        } catch (error: any) {
            setMessage("❌ " + (error.message || "Erro ao salvar"));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8">
            {/* Header Geral */}
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-primary/10 to-transparent rounded-[32px] border border-primary/10">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                    <Bell size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Configurações de Notificações</h2>
                    <p className="text-gray-500">Gerencie como você e seus participantes recebem alertas do sistema</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna 1: WhatsApp */}
                <div className="space-y-6">
                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <MessageSquare size={120} />
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#25D366]/10 rounded-xl text-[#25D366]">
                                <MessageSquare size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">WhatsApp</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                                <ShieldCheck className="text-blue-500 shrink-0" size={20} />
                                <p className="text-sm text-blue-700 leading-relaxed">
                                    Utilizamos a infraestrutura global da <strong>Twilio</strong> para garantir a entrega das mensagens. As credenciais são gerenciadas pelo administrador do sistema.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Alertas Ativos</p>
                                <div className="space-y-3">
                                    {[
                                        { key: "notificarNovaAssinatura", label: "Novas Assinaturas" },
                                        { key: "notificarCobrancaGerada", label: "Cobranças Geradas" },
                                        { key: "notificarCobrancaVencendo", label: "Lembrete de Vencimento" },
                                        { key: "notificarCobrancaAtrasada", label: "Avisos de Atraso" },
                                        { key: "notificarAssinaturaSuspensa", label: "Suspensões Automáticas" },
                                        { key: "notificarPagamentoConfirmado", label: "Confirmações de Pagamento" },
                                    ].map((item) => (
                                        <label key={item.key} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group">
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">{item.label}</span>
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={config[item.key]}
                                                    onChange={(e) => setConfig({ ...config, [item.key]: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pb-4">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    Antecedência (dias)
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        min="0"
                                        max="30"
                                        value={config.diasAvisoVencimento}
                                        onChange={(e) => setConfig({ ...config, diasAvisoVencimento: parseInt(e.target.value) || 0 })}
                                        className="w-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-center"
                                    />
                                    <span className="text-sm text-gray-500">dias antes do vencimento</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50">
                                <label className="flex items-center gap-3 cursor-pointer p-2">
                                    <input
                                        type="checkbox"
                                        checked={config.isAtivo}
                                        onChange={(e) => setConfig({ ...config, isAtivo: e.target.checked })}
                                        className="w-5 h-5 text-primary border-gray-300 rounded-lg focus:ring-primary"
                                    />
                                    <span className="font-bold text-gray-900">Ativar Integração WhatsApp</span>
                                </label>
                            </div>
                        </div>
                    </section> section
                </div>

                {/* Coluna 2: E-mail e Outros */}
                <div className="space-y-6">
                    <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Mail size={120} />
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#E14D2A]/10 rounded-xl text-[#E14D2A]">
                                    <Mail size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">E-mail</h3>
                            </div>
                            <span className="px-3 py-1 bg-accent/20 text-accent text-[10px] font-bold rounded-full border border-accent/20">
                                EM BREVE
                            </span>
                        </div>

                        <div className="space-y-4 opacity-50 grayscale select-none pointer-events-none">
                            <div className="space-y-3">
                                {["Resumo Semanal", "Recibos de Pagamento", "Alertas de Segurança"].map((label) => (
                                    <div key={label} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50">
                                        <span className="text-sm font-medium text-gray-700">{label}</span>
                                        <div className="w-11 h-6 bg-gray-200 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10">
                        <p className="text-sm text-primary font-medium mb-2 italic">Aumente sua produtividade</p>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Novas integrações</h4>
                        <p className="text-sm text-gray-600 mb-4">Estamos preparando integrações com Telegram e Discord para as assinaturas da conta.</p>
                        <div className="flex gap-2">
                            <div className="p-2 bg-white rounded-lg opacity-50"><MessageSquare size={20} /></div>
                            <div className="p-2 bg-white rounded-lg opacity-50"><Bell size={20} /></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ações de Rodapé */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                {message && (
                    <div className={`text-sm font-bold flex items-center gap-2 ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                        {message}
                    </div>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto bg-primary hover:bg-accent text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? "Salvando Configurações..." : "Salvar Notificações"}
                </button>
            </div>
        </div>
    );
}
