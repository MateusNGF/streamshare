import { Skeleton } from "@/components/ui/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ConfiguracoesLoading() {
    return (
        <PageContainer>
            {/* Header Skeleton */}
            <div className="mb-8 md:mb-10">
                <Skeleton variant="text" className="w-48 h-8 mb-2" />
                <Skeleton variant="text" className="w-64 h-4" />
            </div>

            {/* Settings Form Skeleton */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm max-w-2xl">
                <div className="space-y-6">
                    {/* Form Field 1 */}
                    <div>
                        <Skeleton variant="text" className="w-32 h-4 mb-2" />
                        <Skeleton variant="rectangular" className="w-full h-12" />
                    </div>

                    {/* Form Field 2 */}
                    <div>
                        <Skeleton variant="text" className="w-40 h-4 mb-2" />
                        <Skeleton variant="rectangular" className="w-full h-12" />
                    </div>

                    {/* Form Field 3 */}
                    <div>
                        <Skeleton variant="text" className="w-36 h-4 mb-2" />
                        <Skeleton variant="rectangular" className="w-full h-12" />
                    </div>

                    {/* Form Field 4 */}
                    <div>
                        <Skeleton variant="text" className="w-44 h-4 mb-2" />
                        <Skeleton variant="rectangular" className="w-full h-12" />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-6" />

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Skeleton variant="rectangular" className="w-32 h-12" />
                        <Skeleton variant="rectangular" className="w-32 h-12" />
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
