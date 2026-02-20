export function AuthBackground() {
    return (
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-pulse delay-1000" />
            <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-[0.03]" />
        </div>
    );
}
