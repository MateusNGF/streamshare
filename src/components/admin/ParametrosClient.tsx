"use client";
import { Save, Settings, ShieldCheck } from "lucide-react";
import { useActionError } from "@/hooks/useActionError";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
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
        configParams,
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
                    config={configParams}
                />
            )
        }
    ];

    return (
        <PageContainer>
            <div className="max-w-[1200px] mx-auto">
                <PageHeader
                    title="Parâmetros do Sistema"
                    description="Gestão de infraestrutura, integrações e diagnósticos de conectividade."
                    action={
                        activeSection === "general" && (
                            <Button
                                variant="default"
                                onClick={handlers.handleSave}
                                disabled={loading}
                            >
                                <Save size={20} className="group-hover:rotate-12 transition-transform" />
                                {loading ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
                            </Button>
                        )
                    }
                />

                <div className="mt-4">
                    <Tabs
                        tabs={tabsData}
                        value={activeSection}
                        onValueChange={(val) => setActiveSection(val as ConfigSection)}
                    />
                </div>
            </div>
        </PageContainer>
    );
}
