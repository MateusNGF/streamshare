"use client";

import { useEffect, useState } from "react";
import { getWalletData } from "@/actions/wallet";
import { Wallet, TrendingUp, ChevronRight, Loader2 } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function WalletBalanceWidget() {
    const { format } = useCurrency();
    const [saldo, setSaldo] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await getWalletData();
                if (res.success && res.data) {
                    setSaldo(Number(res.data.saldoDisponivel));
                }
            } catch (error) {
                console.error("Failed to fetch wallet balance", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, []);

    if (loading) {
        return (
            <div className="mx-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-center py-6">
                <Loader2 size={20} className="text-primary/40 animate-spin" />
            </div>
        );
    }

    return (
        <Link
            href="/faturamento#extrato"
            className="mx-4 group border border-gray-100 rounded-2xl  bg-white hover:bg-primary/[0.01] hover:border-primary/20 transition-all duration-300 shadow-sm"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform duration-300">
                    <Wallet size={16} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-gray-500/60 uppercase tracking-widest leading-none mb-1">Saldo Disponível</p>
                    <h3 className="text-base font-black text-gray-900 tracking-tight leading-none">
                        {saldo !== null ? format(saldo) : "---"}
                    </h3>
                </div>

                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 group-hover:bg-primary/10 transition-colors">
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-all" />
                </div>
            </div>
        </Link>
    );
}
