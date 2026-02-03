import { Loader2 } from "lucide-react";

export default function CheckoutStartLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">Carregando...</h2>
                <p className="text-gray-500">Preparando informações do checkout.</p>
            </div>
        </div>
    );
}
