"use client";

import { useState, useEffect } from "react";
import { Save, TestTube, Eye, EyeOff } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { upsertParametros, testSmtpConnection, testWhatsAppConnection } from "@/actions/parametros";
import { useToast } from "@/hooks/useToast";

interface Parametro {
    id: number;
    chave: string;
    valor: string;
    tipo: string;
    descricao: string | null;
}

interface ParametrosClientProps {
    initialData: Parametro[];
}

type ConfigSection = "smtp" | "whatsapp" | "general";

export function ParametrosClient({ initialData }: ParametrosClientProps) {
    const toast = useToast();
    const [activeSection, setActiveSection] = useState<ConfigSection>("smtp");
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

    // Helper to get parameter value
    const getParam = (key: string): string => {
        return initialData.find(p => p.chave === key)?.valor || "";
    };

    // SMTP Configuration
    const [smtpConfig, setSmtpConfig] = useState({
        host: getParam("smtp.host"),
        port: getParam("smtp.port"),
        user: getParam("smtp.user"),
        password: getParam("smtp.password"),
        fromEmail: getParam("smtp.from_email"),
        fromName: getParam("smtp.from_name"),
        useTls: getParam("smtp.use_tls") === "true",
    });

    // WhatsApp Configuration
    const [whatsappConfig, setWhatsappConfig] = useState({
        accountSid: getParam("whatsapp.account_sid"),
        authToken: getParam("whatsapp.auth_token"),
        phoneNumber: getParam("whatsapp.phone_number"),
        enabled: getParam("whatsapp.enabled") === "true",
    });

    // General Configuration
    const [generalConfig, setGeneralConfig] = useState({
        appName: getParam("app.name"),
        baseUrl: getParam("app.base_url"),
        timezone: getParam("app.timezone"),
        currency: getParam("app.currency"),
    });

    const togglePasswordVisibility = (field: string) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const parametros = [];

            // SMTP parameters
            if (activeSection === "smtp") {
                parametros.push(
                    { chave: "smtp.host", valor: smtpConfig.host, tipo: "string" },
                    { chave: "smtp.port", valor: smtpConfig.port, tipo: "number" },
                    { chave: "smtp.user", valor: smtpConfig.user, tipo: "string" },
                    { chave: "smtp.password", valor: smtpConfig.password, tipo: "string" },
                    { chave: "smtp.from_email", valor: smtpConfig.fromEmail, tipo: "string" },
                    { chave: "smtp.from_name", valor: smtpConfig.fromName, tipo: "string" },
                    { chave: "smtp.use_tls", valor: smtpConfig.useTls.toString(), tipo: "boolean" }
                );
            }

            // WhatsApp parameters
            if (activeSection === "whatsapp") {
                parametros.push(
                    { chave: "whatsapp.account_sid", valor: whatsappConfig.accountSid, tipo: "string" },
                    { chave: "whatsapp.auth_token", valor: whatsappConfig.authToken, tipo: "string" },
                    { chave: "whatsapp.phone_number", valor: whatsappConfig.phoneNumber, tipo: "string" },
                    { chave: "whatsapp.enabled", valor: whatsappConfig.enabled.toString(), tipo: "boolean" }
                );
            }

            // General parameters
            if (activeSection === "general") {
                parametros.push(
                    { chave: "app.name", valor: generalConfig.appName, tipo: "string" },
                    { chave: "app.base_url", valor: generalConfig.baseUrl, tipo: "string" },
                    { chave: "app.timezone", valor: generalConfig.timezone, tipo: "string" },
                    { chave: "app.currency", valor: generalConfig.currency, tipo: "string" }
                );
            }

            await upsertParametros(parametros);
            toast.success("Configurações salvas com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar configurações");
        } finally {
            setLoading(false);
        }
    };

    const handleTestSmtp = async () => {
        setTesting(true);
        try {
            const result = await testSmtpConnection({
                host: smtpConfig.host,
                port: parseInt(smtpConfig.port) || 587,
                user: smtpConfig.user,
                password: smtpConfig.password,
                fromEmail: smtpConfig.fromEmail,
                fromName: smtpConfig.fromName,
                useTls: smtpConfig.useTls,
            });

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Erro ao testar conexão SMTP");
        } finally {
            setTesting(false);
        }
    };

    const handleTestWhatsApp = async () => {
        setTesting(true);
        try {
            const result = await testWhatsAppConnection({
                accountSid: whatsappConfig.accountSid,
                authToken: whatsappConfig.authToken,
                phoneNumber: whatsappConfig.phoneNumber,
            });

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Erro ao testar conexão WhatsApp");
        } finally {
            setTesting(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Parâmetros do Sistema"
                description="Configure as integrações e parâmetros de infraestrutura"
                action={
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all touch-manipulation disabled:opacity-50"
                    >
                        <Save size={20} />
                        {loading ? "Salvando..." : "Salvar Configurações"}
                    </button>
                }
            />

            {/* Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => setActiveSection("smtp")}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${activeSection === "smtp"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        SMTP
                    </button>
                    <button
                        onClick={() => setActiveSection("whatsapp")}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${activeSection === "whatsapp"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        WhatsApp
                    </button>
                    <button
                        onClick={() => setActiveSection("general")}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${activeSection === "general"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        Geral
                    </button>
                </div>
            </div>

            {/* SMTP Section */}
            {activeSection === "smtp" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            <span className="md:hidden">SMTP</span>
                            <span className="hidden md:inline">Configurações de Email (SMTP)</span>
                        </h3>
                        <button
                            onClick={handleTestSmtp}
                            disabled={testing}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            <TestTube size={18} />
                            {testing ? "Testando..." : (
                                <>
                                    <span className="md:hidden">Testar</span>
                                    <span className="hidden md:inline">Testar Conexão</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Host SMTP"
                            value={smtpConfig.host}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                            placeholder="smtp.gmail.com"
                        />
                        <Input
                            label="Porta"
                            type="number"
                            value={smtpConfig.port}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                            placeholder="587"
                        />
                        <Input
                            label="Usuário"
                            value={smtpConfig.user}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                            placeholder="seu-email@gmail.com"
                        />
                        <div className="relative">
                            <Input
                                label="Senha"
                                type={showPasswords["smtp_password"] ? "text" : "password"}
                                value={smtpConfig.password}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("smtp_password")}
                                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords["smtp_password"] ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <Input
                            label="Email Remetente"
                            type="email"
                            value={smtpConfig.fromEmail}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                            placeholder="noreply@streamshare.com"
                        />
                        <Input
                            label="Nome do Remetente"
                            value={smtpConfig.fromName}
                            onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                            placeholder="StreamShare"
                        />
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={smtpConfig.useTls}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, useTls: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="font-medium text-gray-700">Usar TLS/SSL</span>
                        </label>
                    </div>
                </div>
            )}

            {/* WhatsApp Section */}
            {activeSection === "whatsapp" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            <span className="md:hidden">WhatsApp</span>
                            <span className="hidden md:inline">Configurações WhatsApp </span>
                        </h3>
                        <button
                            onClick={handleTestWhatsApp}
                            disabled={testing}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            <TestTube size={18} />
                            {testing ? "Testando..." : (
                                <>
                                    <span className="md:hidden">Testar</span>
                                    <span className="hidden md:inline">Testar Conexão</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Account SID"
                            value={whatsappConfig.accountSid}
                            onChange={(e) => setWhatsappConfig({ ...whatsappConfig, accountSid: e.target.value })}
                            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                        <div className="relative">
                            <Input
                                label="Auth Token"
                                type={showPasswords["whatsapp_token"] ? "text" : "password"}
                                value={whatsappConfig.authToken}
                                onChange={(e) => setWhatsappConfig({ ...whatsappConfig, authToken: e.target.value })}
                                placeholder="••••••••••••••••••••••••••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("whatsapp_token")}
                                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords["whatsapp_token"] ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <Input
                            label="Número de Telefone"
                            value={whatsappConfig.phoneNumber}
                            onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumber: e.target.value })}
                            placeholder="+5511999999999"
                        />
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={whatsappConfig.enabled}
                                onChange={(e) => setWhatsappConfig({ ...whatsappConfig, enabled: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="font-medium text-gray-700">Habilitar integração WhatsApp</span>
                        </label>
                    </div>
                </div>
            )}

            {/* General Section */}
            {activeSection === "general" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        <span className="md:hidden">Geral</span>
                        <span className="hidden md:inline">Configurações Gerais</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nome da Aplicação"
                            value={generalConfig.appName}
                            onChange={(e) => setGeneralConfig({ ...generalConfig, appName: e.target.value })}
                            placeholder="StreamShare"
                        />
                        <Input
                            label="URL Base"
                            type="url"
                            value={generalConfig.baseUrl}
                            onChange={(e) => setGeneralConfig({ ...generalConfig, baseUrl: e.target.value })}
                            placeholder="https://streamshare.com"
                        />
                        <Input
                            label="Timezone"
                            value={generalConfig.timezone}
                            onChange={(e) => setGeneralConfig({ ...generalConfig, timezone: e.target.value })}
                            placeholder="America/Sao_Paulo"
                        />
                        <Input
                            label="Moeda Padrão"
                            value={generalConfig.currency}
                            onChange={(e) => setGeneralConfig({ ...generalConfig, currency: e.target.value })}
                            placeholder="BRL"
                        />
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
