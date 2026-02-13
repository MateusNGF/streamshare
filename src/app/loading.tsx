import { Spinner } from "@/components/ui/spinner";

export default function RootLoading() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
            <div className="text-center">
                <Spinner size="xl" color="primary" className="mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Carregando...</p>
            </div>
        </div>
    );
}
