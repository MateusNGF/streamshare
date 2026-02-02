"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PoliticaRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/termos-de-uso#policys");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Redirecionando para a Central Legal...</p>
            </div>
        </div>
    );
}
