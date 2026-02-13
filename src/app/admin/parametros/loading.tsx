import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminParametrosLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="mb-8">
                <Skeleton variant="text" className="w-48 h-8 mb-2" />
                <Skeleton variant="text" className="w-64 h-4" />
            </div>

            <div className="space-y-6">
                {/* Section 1 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                    <Skeleton variant="text" className="w-48 h-6 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
                        <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
                    </div>
                </div>

                {/* Section 2 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                    <Skeleton variant="text" className="w-48 h-6 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
                        <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
                        <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
