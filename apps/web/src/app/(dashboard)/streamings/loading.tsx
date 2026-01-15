import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { PageContainer } from "@/components/layout/PageContainer";

export default function StreamingsLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="flex items-start justify-between mb-8 md:mb-10">
                <div>
                    <Skeleton variant="text" className="w-48 h-8 mb-2" />
                    <Skeleton variant="text" className="w-64 h-4" />
                </div>
                <Skeleton variant="rectangular" className="w-40 h-12" />
            </div>

            {/* Search and Filter Skeleton */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
                <Skeleton variant="rectangular" className="w-full h-10 mb-3" />
                <div className="flex gap-2">
                    <Skeleton variant="rectangular" className="w-20 h-9" />
                    <Skeleton variant="rectangular" className="w-20 h-9" />
                    <Skeleton variant="rectangular" className="w-20 h-9" />
                </div>
            </div>

            {/* Streamings Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingCard key={i} variant="detailed" />
                ))}
            </div>
        </PageContainer>
    );
}
