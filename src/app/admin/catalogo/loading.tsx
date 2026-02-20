import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";

export default function AdminCatalogoLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-10">
                <div>
                    <Skeleton variant="text" className="w-48 h-8 md:h-10 mb-2" />
                    <Skeleton variant="text" className="w-64 h-4 md:h-5" />
                </div>
                <Skeleton variant="rectangular" className="w-40 h-12 rounded-2xl" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <LoadingCard key={i} variant="default" />
                ))}
            </div>
        </PageContainer>
    );
}
