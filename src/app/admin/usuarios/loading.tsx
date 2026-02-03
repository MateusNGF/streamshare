import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function AdminUsuariosLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <Skeleton variant="text" className="w-48 h-8 mb-2" />
                    <Skeleton variant="text" className="w-64 h-4" />
                </div>
                <Skeleton variant="rectangular" className="w-40 h-10 rounded-xl" />
            </div>

            {/* Filters Skeleton */}
            <div className="flex gap-4 mb-6">
                <Skeleton variant="rectangular" className="w-full max-w-sm h-10 rounded-xl" />
                <Skeleton variant="rectangular" className="w-32 h-10 rounded-xl" />
            </div>

            {/* Table Skeleton */}
            <TableSkeleton columns={5} rows={10} />
        </PageContainer>
    );
}
