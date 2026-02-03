import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";

export default function AdminCatalogoLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Skeleton variant="text" className="w-48 h-8 mb-2" />
                    <Skeleton variant="text" className="w-64 h-4" />
                </div>
                <Skeleton variant="rectangular" className="w-40 h-10 rounded-xl" />
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
