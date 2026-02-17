"use client";

import { useState } from "react";
import { Save, Mail, MessageSquare, Settings } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { upsertParametros, testSmtpConnection, testWhatsAppConnection } from "@/actions/parametros";
import { useToast } from "@/hooks/useToast";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { SmtpTab } from "@/components/admin/parametros/SmtpTab";
import { WhatsappTab } from "@/components/admin/parametros/WhatsappTab";
import { GeneralTab } from "@/components/admin/parametros/GeneralTab";

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

            const result = await upsertParametros(parametros);
            if (result.success) {
                toast.success("Configurações salvas com sucesso!");
            } else if (result.error) {
                toast.error(result.error);
            }
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
                toast.success(result.data?.message || "Conexão SMTP testada com sucesso!");
            } else {
                toast.error(result.error || "Erro ao testar conexão SMTP");
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
                toast.success(result.data?.message || "Conexão WhatsApp testada com sucesso!");
            } else {
                toast.error(result.error || "Erro ao testar conexão WhatsApp");
            }
        } catch (error) {
            toast.error("Erro ao testar conexão WhatsApp");
        } finally {
            setTesting(false);
        }
    };

    const tabsData: TabItem[] = [
        {
            id: "smtp",
            label: "SMTP",
            icon: Mail,
            content: (
                <SmtpTab
                    config={smtpConfig}
                    onChange={setSmtpConfig}
                    showPassword={!!showPasswords["smtp_password"]}
                    onTogglePassword={() => togglePasswordVisibility("smtp_password")}
                    onTest={handleTestSmtp}
                    testing={testing}
                />
            )
        },
        {
            id: "whatsapp",
            label: "WhatsApp",
            icon: MessageSquare,
            content: (
                <WhatsappTab
                    config={whatsappConfig}
                    onChange={setWhatsappConfig}
                    showPassword={!!showPasswords["whatsapp_token"]}
                    onTogglePassword={() => togglePasswordVisibility("whatsapp_token")}
                    onTest={handleTestWhatsApp}
                    testing={testing}
                />
            )
        },
        {
            id: "general",
            label: "Geral",
            icon: Settings,
            content: (
                <GeneralTab
                    config={generalConfig}
                    onChange={setGeneralConfig}
                />
            )
        }
    ];

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

            <Tabs
                tabs={tabsData}
                value={activeSection}
                onValueChange={(val) => setActiveSection(val as ConfigSection)}
            />
        </PageContainer>
    );
}
