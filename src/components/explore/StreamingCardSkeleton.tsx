import { Skeleton } from "@/components/ui/Skeleton";

export function StreamingCardSkeleton() {
    return (
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-white/20 shadow-sm flex flex-col h-full">
            {/* Top Row: Logo & Host Info */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex w-full justify-between gap items-center gap-4">
                    <div className="relative">
                        <Skeleton className="w-16 h-16 !rounded-2xl" />
                    </div>
                    <div className="flex flex-col justify-between w-full space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            </div>

            {/* Middle Section: Progress & Financial */}
            <div className="space-y-4 flex-1">
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-5 w-1/4 !rounded-lg" />
                    </div>

                    <Skeleton className="w-full h-3 !rounded-full" />

                    <div className="flex items-center justify-between py-3 px-3 rounded-2xl border border-gray-100 mt-4">
                        <div className="flex flex-row justify-between items-center w-full gap-4">
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-6 w-1/3" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Actions */}
            <div className="mt-8">
                <Skeleton className="h-12 w-full !rounded-xl" />
            </div>
        </div>
    );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {Array.from({ length: count }).map((_, i) => (
                <StreamingCardSkeleton key={i} />
            ))}
        </div>
    );
}
