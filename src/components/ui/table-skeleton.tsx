import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export function TableSkeleton({ rows = 5, columns = 6, className }: TableSkeletonProps) {
    return (
        <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", className)}>
            {/* Header Skeleton */}
            <div className="bg-gray-50/50 border-b border-gray-100 flex items-center px-6 py-3 gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <div key={i} className={cn("flex items-center gap-2", i === 0 ? "flex-1" : "w-24 justify-center")}>
                        <Skeleton variant="circular" width={12} height={12} className="opacity-40" />
                        <Skeleton variant="text" className="w-16 h-3 opacity-40" />
                    </div>
                ))}
            </div>

            {/* Rows Skeleton */}
            <div className="divide-y divide-gray-100 px-6">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="flex items-center gap-4 py-5"
                    >
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <div
                                key={colIndex}
                                className={cn("flex flex-col gap-1", colIndex === 0 ? "flex-1" : "w-24 items-center")}
                            >
                                <Skeleton
                                    variant="text"
                                    className={cn(colIndex === 0 ? "w-32 h-4" : "w-16 h-3")}
                                />
                                {colIndex === 0 && (
                                    <Skeleton variant="text" className="w-24 h-2 opacity-50" />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
