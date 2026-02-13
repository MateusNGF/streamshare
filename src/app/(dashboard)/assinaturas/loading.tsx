import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Loading() {
    return (
        <PageContainer>
            <PageHeader
                title="Assinaturas"
                description="Gerencie as assinaturas dos participantes e monitore a receita."
                action={
                    <Button disabled className="gap-2 opacity-50">
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nova Assinatura</span>
                        <span className="sm:hidden">Nova</span>
                    </Button>
                }
            />

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <Skeleton variant="circular" width={40} height={40} className="mb-4 opacity-20" />
                        <Skeleton variant="text" className="w-24 h-6 mb-2" />
                        <Skeleton variant="text" className="w-16 h-3 opacity-40 uppercase tracking-widest" />
                    </div>
                ))}
            </div>

            <div className="space-y-10">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex gap-4">
                        <Skeleton variant="rectangular" className="flex-1 h-10 rounded-xl" />
                        <Skeleton variant="rectangular" className="w-32 h-10 rounded-xl" />
                        <Skeleton variant="rectangular" className="w-40 h-10 rounded-xl" />
                    </div>
                </div>

                <TableSkeleton rows={8} columns={7} />
            </div>
        </PageContainer>
    );
}
