import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Loading() {
    return (
        <PageContainer>
            <PageHeader
                title="Assinaturas"
                description="Gerencie as assinaturas dos participantes."
                action={
                    <div className="flex gap-3">
                        <Button disabled className="gap-2">
                            <Plus size={20} />
                            <span className="hidden sm:inline">Nova Assinatura</span>
                            <span className="sm:hidden">Nova</span>
                        </Button>
                    </div>
                }
            />
            <div className="bg-card text-card-foreground shadow-sm rounded-md border">
                <TableSkeleton rows={5} columns={6} />
            </div>
        </PageContainer>
    );
}
