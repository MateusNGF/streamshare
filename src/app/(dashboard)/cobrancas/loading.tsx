import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function CobrancasLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <Skeleton variant="text" className="w-48 h-8 mb-2" />
                    <Skeleton variant="text" className="w-64 h-4" />
                </div>
                <div className="flex gap-2">
                    <Skeleton variant="rectangular" className="w-32 h-10 rounded-xl" />
                    <Skeleton variant="rectangular" className="w-32 h-10 rounded-xl" />
                </div>
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                        <Skeleton variant="text" className="w-24 h-4 mb-2" />
                        <Skeleton variant="text" className="w-32 h-8" />
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <TableSkeleton columns={6} rows={8} />
        </PageContainer>
    );
}
