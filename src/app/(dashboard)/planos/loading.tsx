import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PlanosLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="mb-8">
                <Skeleton variant="text" className="w-48 h-8 mb-2" />
                <Skeleton variant="text" className="w-64 h-4" />
            </div>

            {/* Current Plan Skeleton */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 w-full">
                        <Skeleton variant="text" className="w-32 h-6" />
                        <Skeleton variant="text" className="w-48 h-10" />
                    </div>
                    <Skeleton variant="rectangular" className="w-full md:w-48 h-12 rounded-xl" />
                </div>
            </div>

            {/* Other Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col h-full">
                        <Skeleton variant="circular" width={48} height={48} className="mb-4" />
                        <Skeleton variant="text" className="w-32 h-6 mb-2" />
                        <Skeleton variant="text" className="w-full h-24 mb-6" />
                        <Skeleton variant="rectangular" className="w-full h-10 mt-auto rounded-xl" />
                    </div>
                ))}
            </div>
        </PageContainer>
    );
}
