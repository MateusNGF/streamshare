import { Skeleton } from "@/components/ui/Skeleton";

export default function ResetPasswordLoading() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
            <div className="bg-white rounded-[32px] shadow-2xl p-8 md:p-12 w-full max-w-md">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <Skeleton variant="text" className="w-32 h-4 mx-auto" />
                </div>
            </div>
        </div>
    );
}
