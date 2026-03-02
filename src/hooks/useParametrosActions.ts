import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import { upsertParametros, testSmtpConnection, testWhatsAppConnection, getConfigParams } from "@/actions/parametros";

export type ConfigSection = "general" | "tests";

interface Parametro {
    chave: string;
    valor: string;
    tipo: string;
}

export function useParametrosActions(initialData: any[]) {
    const toast = useToast();
    const [activeSection, setActiveSection] = useState<ConfigSection>("general");
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [configParams, setConfigParams] = useState<any>(null);

    const getParam = (key: string): string => {
        return initialData.find(p => p.chave === key)?.valor || "";
    };

    const [generalConfig, setGeneralConfig] = useState({
        appName: getParam("app.name"),
        baseUrl: getParam("app.base_url"),
        timezone: getParam("app.timezone"),
        currency: getParam("app.currency"),
    });

    useEffect(() => {
        const fetchConfig = async () => {
            const result = await getConfigParams();
            if (result.success && 'data' in result) {
                setConfigParams(result.data);
            }
        };
        fetchConfig();
    }, []);

    const togglePasswordVisibility = (field: string) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const parametros: Parametro[] = [];

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
            const result = await testSmtpConnection();
            if (result.success) {
                const message = (result as any).data?.message || "Conexão SMTP testada com sucesso!";
                toast.success(message);
            } else {
                toast.error(result.error || "Erro ao testar SMTP");
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
            const result = await testWhatsAppConnection();
            if (result.success) {
                const message = (result as any).data?.message || "Conexão WhatsApp testada com sucesso!";
                toast.success(message);
            } else {
                toast.error(result.error || "Erro ao testar WhatsApp");
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
        generalConfig,
        setGeneralConfig,
        configParams,
        handlers: {
            handleSave,
            handleTestSmtp,
            handleTestWhatsApp,
            togglePasswordVisibility
        }
    };
}
