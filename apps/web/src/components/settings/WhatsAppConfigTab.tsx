"use client";

import { useState, useEffect } from "react";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { getWhatsAppConfig, saveWhatsAppConfig, testWhatsAppConnection } from "@/actions/whatsapp";

export default function WhatsAppConfigTab() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testNumber, setTestNumber] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        try {
            const data = await getWhatsAppConfig();
            setConfig(data || {
                apiKey: "",
                apiSecret: "",
                phoneNumber: "",
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
            setMessage("Configuração salva com sucesso!");
            await loadConfig(); // Reload para ocultar credenciais
        } catch (error: any) {
            setMessage(error.message || "Erro ao salvar");
        } finally {
            setSaving(false);
        }
    }

    async function handleTest() {
        if (!testNumber) {
            setMessage("Informe um número para teste");
            return;
        }

        setTesting(true);
        setMessage("");
        try {
            const result = await testWhatsAppConnection(testNumber);
            if (result.success) {
                setMessage("✅ Mensagem de teste enviada com sucesso!");
            } else {
                setMessage(`❌ ${result.message || "Erro ao enviar teste"}`);
            }
        } catch (error: any) {
            setMessage(`❌ Erro: ${error.message}`);
        } finally {
            setTesting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-gray-900">Integração WhatsApp</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Configure notificações automáticas via WhatsApp para seus participantes
                </p>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                    ⚠️ <strong>Atenção:</strong> O envio de mensagens via Twilio WhatsApp tem custo.
                    Aproximadamente $0.005 - $0.01 USD por mensagem.
                </p>
            </div>

            {/* Info sobre Twilio */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    📱 <strong>Twilio:</strong> Plataforma líder global para comunicação.
                    <br />Documentação: <a href="https://www.twilio.com/docs/whatsapp" target="_blank" rel="noopener noreferrer" className="underline font-semibold">twilio.com/docs/whatsapp</a>
                    <br />Console: <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">console.twilio.com</a>
                </p>
            </div>

            {/* Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Account SID
                        <span className="text-xs text-gray-500 ml-2">(Twilio)</span>
                    </label>
                    <input
                        type="text"
                        value={config.apiKey}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <p className="text-xs text-gray-500">Encontre no Console do Twilio</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Auth Token
                        <span className="text-xs text-gray-500 ml-2">(Twilio)</span>
                    </label>
                    <input
                        type="password"
                        value={config.apiSecret || ""}
                        onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                        placeholder="Seu Auth Token do Twilio"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <p className="text-xs text-gray-500">Token de autenticação do Twilio</p>
                </div>
            </div>

            <div className="space-y-2">
                <PhoneInput
                    label="Número WhatsApp (From)"
                    value={config.phoneNumber || ""}
                    onChange={(value) => setConfig({ ...config, phoneNumber: value })}
                    placeholder="+14155238886"
                />
                <p className="text-xs text-gray-500">
                    Número WhatsApp habilitado no Twilio (formato E.164)
                </p>
            </div>

            {/* Notification Settings */}
            <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tipos de Notificação</h3>
                <div className="space-y-3">
                    {[
                        { key: "notificarNovaAssinatura", label: "Nova Assinatura" },
                        { key: "notificarCobrancaGerada", label: "Cobrança Gerada" },
                        { key: "notificarCobrancaVencendo", label: "Cobrança Vencendo" },
                        { key: "notificarCobrancaAtrasada", label: "Cobrança Atrasada" },
                        { key: "notificarAssinaturaSuspensa", label: "Assinatura Suspensa" },
                        { key: "notificarPagamentoConfirmado", label: "Pagamento Confirmado" },
                    ].map((item) => (
                        <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config[item.key]}
                                onChange={(e) =>
                                    setConfig({ ...config, [item.key]: e.target.checked })
                                }
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Avisar vencimento com antecedência (dias)
                </label>
                <input
                    type="number"
                    min="0"
                    max="30"
                    value={config.diasAvisoVencimento}
                    onChange={(e) =>
                        setConfig({ ...config, diasAvisoVencimento: parseInt(e.target.value) || 0 })
                    }
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
            </div>

            {/* Active Toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={config.isAtivo}
                    onChange={(e) => setConfig({ ...config, isAtivo: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">Integração Ativa</span>
            </label>

            {/* Test Section */}
            <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Testar Conexão</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <PhoneInput
                            value={testNumber}
                            onChange={setTestNumber}
                            placeholder="+5511999999999"
                        />
                    </div>
                    <button
                        onClick={handleTest}
                        disabled={testing}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
                    >
                        {testing ? "Enviando..." : "Enviar Teste"}
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`p-4 rounded-lg ${message.includes("✅") || message.includes("sucesso")
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                >
                    {message}
                </div>
            )}

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
                {saving ? "Salvando..." : "Salvar Configuração"}
            </button>
        </div>
    );
}
