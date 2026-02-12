import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function CobrancasLoading() {
    return (
        <PageContainer>
            <PageHeader
                title="Cobranças"
                description="Controle de pagamentos e envios de cobrança."
            />

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <Skeleton variant="circular" width={40} height={40} className="mb-4 opacity-20" />
                        <Skeleton variant="text" className="w-24 h-6 mb-2" />
                        <Skeleton variant="text" className="w-16 h-3 opacity-40 uppercase tracking-widest" />
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
                    <div className="flex gap-4">
                        <Skeleton variant="rectangular" className="flex-1 h-10 rounded-xl" />
                        <Skeleton variant="rectangular" className="w-full md:w-[200px] h-10 rounded-xl" />
                    </div>
                </div>

                <TableSkeleton rows={8} columns={6} />
            </div>
        </PageContainer>
    );
}
