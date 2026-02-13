import { Spinner } from "./spinner";

export function LoadingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
            <Spinner size="xl" />
            <p className="text-muted-foreground animate-pulse text-sm font-medium">Carregando...</p>
        </div>
    );
}
