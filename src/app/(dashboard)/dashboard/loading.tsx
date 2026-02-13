import { Skeleton } from "@/components/ui/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";

export default function DashboardLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="mb-8 md:mb-10">
                <Skeleton variant="text" className="w-48 h-10 mb-2" />
                <Skeleton variant="text" className="w-64 h-4 opacity-50" />
            </div>

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

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                {/* Streamings Section */}
                <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Skeleton variant="text" className="w-40 h-6 mb-1" />
                            <Skeleton variant="text" className="w-32 h-3 opacity-50" />
                        </div>
                        <Skeleton variant="rectangular" className="w-24 h-8 rounded-xl opacity-20" />
                    </div>
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 bg-gray-50/30">
                                <Skeleton variant="circular" width={48} height={48} className="opacity-20" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton variant="text" className="w-32 h-4" />
                                    <Skeleton variant="text" className="w-24 h-3 opacity-50" />
                                </div>
                                <Skeleton variant="rectangular" className="w-20 h-6 rounded-full opacity-20" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Subscriptions Section */}
                <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Skeleton variant="text" className="w-48 h-6 mb-1" />
                            <Skeleton variant="text" className="w-40 h-3 opacity-50" />
                        </div>
                        <Skeleton variant="rectangular" className="w-24 h-8 rounded-xl opacity-20" />
                    </div>
                    <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                                <Skeleton variant="circular" width={12} height={12} className="opacity-20" />
                                <div className="flex-1">
                                    <Skeleton variant="text" className="w-40 h-4 mb-1" />
                                    <Skeleton variant="text" className="w-24 h-2 opacity-30" />
                                </div>
                                <div className="text-right">
                                    <Skeleton variant="text" className="w-16 h-4 mb-1 ml-auto" />
                                    <Skeleton variant="text" className="w-12 h-2 opacity-30 ml-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </PageContainer>
    );
}
