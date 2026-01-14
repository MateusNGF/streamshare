import { Skeleton } from "./Skeleton";

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
    return (
        <div className="space-y-3 p-6">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className={colIndex === 0 ? "flex-1" : "w-24"}
                        >
                            <Skeleton
                                variant="text"
                                className={colIndex === 0 ? "w-3/4" : "w-full"}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
