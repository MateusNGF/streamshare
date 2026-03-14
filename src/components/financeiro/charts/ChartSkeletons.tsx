import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
    title: string;
    description?: string;
    className?: string;
}

export function ChartContainerSkeleton({ title, description, className }: ChartSkeletonProps) {
    return (
        <div className={cn("bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-[400px]", className)}>
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <Skeleton className="w-4 h-4 rounded-full" />
                </div>
                {description && <p className="text-xs text-gray-500">{description}</p>}
            </div>
            <div className="flex-1 flex items-center justify-center relative">
                <Skeleton className="absolute w-[200px] h-[200px] rounded-full opacity-20" />
                <Skeleton className="absolute w-[160px] h-[160px] rounded-full border-[20px] border-gray-100 bg-transparent" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3 pt-6 border-t border-gray-50">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <Skeleton className="w-8 h-4 rounded-md" />
                        <Skeleton className="w-12 h-2 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function BarChartSkeleton({ title, description, className }: ChartSkeletonProps) {
    return (
        <div className={cn("bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-[400px]", className)}>
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <Skeleton className="w-4 h-4 rounded-full" />
                </div>
                {description && <p className="text-xs text-gray-500">{description}</p>}
            </div>
            <div className="flex-1 space-y-4 pt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-16 h-3 rounded-full" />
                        <Skeleton className={cn("h-6 rounded-r-lg", i === 1 ? "w-full" : i === 2 ? "w-3/4" : i === 3 ? "w-1/2" : "w-1/3")} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function StackedBarChartSkeleton({ title, description, className }: ChartSkeletonProps) {
    return (
        <div className={cn("bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-[400px]", className)}>
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{title}</h3>
                        <Skeleton className="w-4 h-4 rounded-full" />
                    </div>
                    {description && <p className="text-xs text-gray-500">{description}</p>}
                </div>
                <div className="flex gap-2">
                    <Skeleton className="w-12 h-3 rounded-full" />
                    <Skeleton className="w-12 h-3 rounded-full" />
                    <Skeleton className="w-12 h-3 rounded-full" />
                </div>
            </div>
            <div className="flex-1 flex items-end gap-6 px-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex-1 flex flex-col gap-1 items-stretch">
                        <Skeleton className={cn("w-full rounded-t-md", i % 2 === 0 ? "h-24" : "h-36")} />
                        <Skeleton className="w-full h-8" />
                        <Skeleton className="w-full h-4" />
                        <div className="mt-2 flex justify-center">
                            <Skeleton className="w-8 h-2 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
