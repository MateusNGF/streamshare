"use client";

import { useState, useEffect } from "react";
import { generateStaticPix } from "@/lib/pix-generator";

interface UsePixGeneratorProps {
    isOpen: boolean;
    status: string;
    chavePix?: string;
    nomeConta: string;
    valor: number;
    id: string | number;
    prefix: string;
}

export function usePixGenerator({
    isOpen,
    status,
    chavePix,
    nomeConta,
    valor,
    id,
    prefix
}: UsePixGeneratorProps) {
    const [pixPayload, setPixPayload] = useState<string>("");
    const [isLoadingPix, setIsLoadingPix] = useState(false);

    useEffect(() => {
        async function loadPix() {
            if (isOpen && chavePix && id && (status === "pendente" || status === "atrasado")) {
                setIsLoadingPix(true);
                try {
                    const payload = await generateStaticPix(
                        chavePix,
                        nomeConta,
                        "Brasil",
                        valor,
                        `${prefix}-${id}`
                    );
                    setPixPayload(payload);
                } catch (err) {
                    console.error("Erro ao gerar PIX:", err);
                } finally {
                    setIsLoadingPix(false);
                }
            }
        }
        loadPix();
    }, [isOpen, chavePix, nomeConta, valor, id, status, prefix]);

    return {
        pixPayload,
        isLoadingPix
    };
}
