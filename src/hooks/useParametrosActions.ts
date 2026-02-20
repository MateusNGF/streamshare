import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { upsertParametros, testSmtpConnection, testWhatsAppConnection } from "@/actions/parametros";

export type ConfigSection = "smtp" | "whatsapp" | "general";

interface Parametro {
    chave: string;
    valor: string;
    tipo: string;
}

export function useParametrosActions(initialData: any[]) {
    const toast = useToast();
    const [activeSection, setActiveSection] = useState<ConfigSection>("smtp");
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

    const getParam = (key: string): string => {
        return initialData.find(p => p.chave === key)?.valor || "";
    };

    // Configuration States
    const [smtpConfig, setSmtpConfig] = useState({
        host: getParam("smtp.host"),
        port: getParam("smtp.port"),
        user: getParam("smtp.user"),
        password: getParam("smtp.password"),
        fromEmail: getParam("smtp.from_email"),
        fromName: getParam("smtp.from_name"),
        useTls: getParam("smtp.use_tls") === "true",
    });

    const [whatsappConfig, setWhatsappConfig] = useState({
        accountSid: getParam("whatsapp.account_sid"),
        authToken: getParam("whatsapp.auth_token"),
        phoneNumber: getParam("whatsapp.phone_number"),
        enabled: getParam("whatsapp.enabled") === "true",
    });

    const [generalConfig, setGeneralConfig] = useState({
        appName: getParam("app.name"),
        baseUrl: getParam("app.base_url"),
        timezone: getParam("app.timezone"),
        currency: getParam("app.currency"),
        streamshareFee: getParam("TAXA_PLATAFORMA_PERCENTUAL") || process.env.NEXT_PUBLIC_TAXA_PLATAFORMA_PERCENTUAL || "5",
    });

    const togglePasswordVisibility = (field: string) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const parametros: Parametro[] = [];

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

            if (activeSection === "whatsapp") {
                parametros.push(
                    { chave: "whatsapp.account_sid", valor: whatsappConfig.accountSid, tipo: "string" },
                    { chave: "whatsapp.auth_token", valor: whatsappConfig.authToken, tipo: "string" },
                    { chave: "whatsapp.phone_number", valor: whatsappConfig.phoneNumber, tipo: "string" },
                    { chave: "whatsapp.enabled", valor: whatsappConfig.enabled.toString(), tipo: "boolean" }
                );
            }

            if (activeSection === "general") {
                parametros.push(
                    { chave: "app.name", valor: generalConfig.appName, tipo: "string" },
                    { chave: "app.base_url", valor: generalConfig.baseUrl, tipo: "string" },
                    { chave: "app.timezone", valor: generalConfig.timezone, tipo: "string" },
                    { chave: "app.currency", valor: generalConfig.currency, tipo: "string" },
                    { chave: "TAXA_PLATAFORMA_PERCENTUAL", valor: generalConfig.streamshareFee, tipo: "string" }
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

    return {
        activeSection,
        setActiveSection,
        loading,
        testing,
        showPasswords,
        smtpConfig,
        setSmtpConfig,
        whatsappConfig,
        setWhatsappConfig,
        generalConfig,
        setGeneralConfig,
        handlers: {
            handleSave,
            handleTestSmtp,
            handleTestWhatsApp,
            togglePasswordVisibility
        }
    };
}
