"use client";
import { Save, Settings, ShieldCheck } from "lucide-react";
import { useActionError } from "@/hooks/useActionError";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { useParametrosActions, ConfigSection } from "@/hooks/useParametrosActions";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

const GeneralTab = dynamic(() => import("@/components/admin/parametros/GeneralTab").then(mod => mod.GeneralTab), {
    loading: () => <Skeleton className="w-full h-[400px] rounded-[32px]" />
});

const TestsTab = dynamic(() => import("@/components/admin/parametros/TestsTab").then(mod => mod.TestsTab), {
    loading: () => <Skeleton className="w-full h-[400px] rounded-[32px]" />
});

interface ParametrosClientProps {
    initialData: any[];
    error?: string;
}

export function ParametrosClient({ initialData, error }: ParametrosClientProps) {
    useActionError(error);
    const {
        activeSection,
        setActiveSection,
        loading,
        testing,
        generalConfig,
        setGeneralConfig,
        handlers
    } = useParametrosActions(initialData);

    const tabsData: TabItem[] = [
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
        },
        {
            id: "tests",
            label: "Diagnóstico",
            icon: ShieldCheck,
            content: (
                <TestsTab
                    onTestSmtp={handlers.handleTestSmtp}
                    onTestWhatsApp={handlers.handleTestWhatsApp}
                    testing={testing}
                />
            )
        }
    ];

    return (
        <PageContainer>
            <PageHeader
                title="Parâmetros do Sistema"
                description="Gerencie as configurações e testes de integração"
                action={
                    activeSection === "general" && (
                        <button
                            onClick={handlers.handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all touch-manipulation disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? "Salvando..." : "Salvar Configurações"}
                        </button>
                    )
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
