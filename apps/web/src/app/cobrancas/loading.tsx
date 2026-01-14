import { Skeleton } from "@/components/ui/Skeleton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";

export default function CobrancasLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="flex items-start justify-between mb-8 md:mb-10">
                <div>
                    <Skeleton variant="text" className="w-48 h-8 mb-2" />
                    <Skeleton variant="text" className="w-64 h-4" />
                </div>
                <Skeleton variant="rectangular" className="w-32 h-12" />
            </div>

            {/* Search and Filters Skeleton */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-8">
                <Skeleton variant="rectangular" className="w-full h-10 mb-3" />
                <div className="flex gap-2">
                    <Skeleton variant="rectangular" className="w-20 h-9" />
                    <Skeleton variant="rectangular" className="w-24 h-9" />
                    <Skeleton variant="rectangular" className="w-24 h-9" />
                    <Skeleton variant="rectangular" className="w-20 h-9" />
                </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <Skeleton variant="text" className="w-28 h-3 mb-2" />
                        <Skeleton variant="text" className="w-24 h-8" />
                    </div>
                ))}
            </div>

            {/* Payments Table Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100">
                    <Skeleton variant="text" className="w-48 h-6" />
                </div>
                <TableSkeleton rows={8} columns={5} />
            </div>
        </PageContainer>
    );
}
