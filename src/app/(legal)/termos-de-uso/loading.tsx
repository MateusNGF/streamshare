import { Skeleton } from "@/components/ui/skeleton";

export default function TermosLoading() {
    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="container mx-auto px-6 max-w-4xl bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
                {/* Back Button Skeleton */}
                <Skeleton variant="text" className="w-24 h-6 mb-8" />

                {/* Title Skeleton */}
                <Skeleton variant="text" className="w-64 h-10 mb-2" />
                <Skeleton variant="text" className="w-48 h-4 mb-8" />

                <div className="space-y-8">
                    {/* Summary Box Skeleton */}
                    <div className="bg-blue-50 border-l-4 border-blue-200 p-4 rounded-r space-y-2">
                        <Skeleton variant="text" className="w-1/2 h-6" />
                        <Skeleton variant="text" className="w-full h-4" />
                        <Skeleton variant="text" className="w-3/4 h-4" />
                    </div>

                    {/* Section Skeletons */}
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton variant="text" className="w-1/3 h-8" />
                            <div className="space-y-2">
                                <Skeleton variant="text" className="w-full h-4" />
                                <Skeleton variant="text" className="w-full h-4" />
                                <Skeleton variant="text" className="w-5/6 h-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
