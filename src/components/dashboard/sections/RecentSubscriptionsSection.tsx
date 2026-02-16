"use client";

import { RecentSubscription } from "@/components/dashboard/RecentSubscription";
import { ArrowUpRight, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

interface RecentSubscriptionsSectionProps {
    recentSubscriptions: any[];
}

export function RecentSubscriptionsSection({ recentSubscriptions }: RecentSubscriptionsSectionProps) {
    return (
        <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Atividades Recentes</h2>
                <Link href="/assinaturas" className="p-2 hover:bg-violet-50 rounded-xl transition-all text-primary group">
                    <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>
            <div className="space-y-4 flex-1">
                {recentSubscriptions.length > 0 ? (
                    recentSubscriptions.map((sub) => (
                        <RecentSubscription
                            key={sub.id}
                            name={sub.participante.nome}
                            streaming={sub.streaming.apelido || sub.streaming.catalogo.nome}
                            value={sub.valor.toNumber ? sub.valor.toNumber() : sub.valor}
                            status={sub.status === "ativa" ? "Ativa" : "Em atraso"}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center h-full">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <Search className="text-gray-300" size={32} />
                        </div>
                        <p className="text-gray-400 text-sm">Aguardando novas adesões.</p>
                    </div>
                )}
            </div>
            {recentSubscriptions.length > 0 && (
                <Link href="/assinaturas" className="flex items-center justify-center w-full py-4 mt-6 border-t border-gray-50 text-sm font-bold text-gray-500 hover:text-primary transition-all gap-1 group">
                    Ver todas as assinaturas
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            )}
        </section>
    );
}
