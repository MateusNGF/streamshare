import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { PageContainer } from "@/components/layout/PageContainer";

export default function DashboardLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="mb-8 md:mb-10">
                <Skeleton variant="text" className="w-48 h-8 mb-2" />
                <Skeleton variant="text" className="w-64 h-4" />
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <Skeleton variant="text" className="w-32 h-4 mb-2" />
                        <Skeleton variant="text" className="w-24 h-8" />
                    </div>
                ))}
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                {/* Streamings Section */}
                <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <Skeleton variant="text" className="w-40 h-6" />
                        <Skeleton variant="text" className="w-24 h-4" />
                    </div>
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <LoadingCard key={i} variant="compact" />
                        ))}
                    </div>
                </section>

                {/* Recent Subscriptions Section */}
                <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <Skeleton variant="text" className="w-48 h-6" />
                        <Skeleton variant="text" className="w-24 h-4" />
                    </div>
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <LoadingCard key={i} variant="compact" />
                        ))}
                    </div>
                </section>
            </div>
        </PageContainer>
    );
}
