import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { PageContainer } from "@/components/layout/PageContainer";

export default function StreamingsLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="mb-8 md:mb-10">
                <Skeleton variant="text" className="w-48 h-10 mb-2" />
                <Skeleton variant="text" className="w-64 h-4 opacity-50" />
            </div>

            {/* Search and Filter Skeleton */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-10">
                <div className="flex gap-4">
                    <Skeleton variant="rectangular" className="flex-1 h-10 rounded-xl" />
                    <div className="hidden md:flex gap-2">
                        <Skeleton variant="rectangular" className="w-24 h-10 rounded-xl" />
                        <Skeleton variant="rectangular" className="w-24 h-10 rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Streamings Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <Skeleton variant="circular" width={48} height={48} className="opacity-20" />
                            <div className="flex-1 space-y-2">
                                <Skeleton variant="text" className="w-32 h-4" />
                                <Skeleton variant="text" className="w-24 h-2 opacity-50" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Skeleton variant="text" className="w-20 h-3 opacity-40" />
                                <Skeleton variant="text" className="w-12 h-3" />
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <Skeleton variant="rectangular" className="h-full w-2/3" />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <Skeleton variant="rectangular" className="w-24 h-8 rounded-xl opacity-20" />
                                <Skeleton variant="rectangular" className="w-8 h-8 rounded-lg opacity-20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </PageContainer>
    );
}
