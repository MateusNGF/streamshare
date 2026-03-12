import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useWizardURLSync() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateUrl = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) params.delete(key);
            else params.set(key, value);
        });
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const getParam = (key: string) => searchParams.get(key);

    return {
        updateUrl,
        getParam,
        searchParams: searchParams.toString()
    };
}
