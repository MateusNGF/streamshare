"use client";
import { Save, Mail, MessageSquare, Settings } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { SmtpTab } from "@/components/admin/parametros/SmtpTab";
import { WhatsappTab } from "@/components/admin/parametros/WhatsappTab";
import { GeneralTab } from "@/components/admin/parametros/GeneralTab";
import { useParametrosActions, ConfigSection } from "@/hooks/useParametrosActions";

interface ParametrosClientProps {
    initialData: any[];
}

export function ParametrosClient({ initialData }: ParametrosClientProps) {
    const {
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
        handlers
    } = useParametrosActions(initialData);

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
                    onTogglePassword={() => handlers.togglePasswordVisibility("smtp_password")}
                    onTest={handlers.handleTestSmtp}
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
                    onTogglePassword={() => handlers.togglePasswordVisibility("whatsapp_token")}
                    onTest={handlers.handleTestWhatsApp}
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
                        onClick={handlers.handleSave}
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
