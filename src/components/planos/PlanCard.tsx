import { PlanDefinition } from "@/config/plans";
import { Check, Loader2 } from "lucide-react";

interface PlanCardProps {
    plan: PlanDefinition;
    isCurrent: boolean;
    loading: boolean;
    disabled?: boolean;
    onSelect: (plan: PlanDefinition) => void;
}

export function PlanCard({ plan, isCurrent, loading, disabled, onSelect }: PlanCardProps) {
    const isHighlighted = plan.highlighted;

    return (
        <div className={`relative flex flex-col p-6 rounded-[32px] border transition-all duration-300 w-full sm:w-[320px] h-full
      ${isHighlighted ? 'bg-white border-primary shadow-xl sm:scale-105 z-10' : 'bg-gray-50 border-gray-100'}`}>

            {/* Selo de Destaque sutil conforme o padrão do sistema */}
            {isHighlighted && (
                <span className="absolute -top-3 left-6 px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                    Recomendado
                </span>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-gray-900">
                    R$ {typeof plan.price === 'number' ? plan.price.toFixed(2).replace('.', ',') : plan.price}
                </span>
                <span className="text-xs font-medium text-gray-400">/mês</span>
            </div>

            <div className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`p-1 rounded-lg ${feature.included ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-300'}`}>
                            <Check size={14} strokeWidth={3} />
                        </div>
                        <span className={`text-sm ${feature.included ? 'text-gray-600' : 'text-gray-400 line-through'}`}>
                            {feature.text}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onSelect(plan)}
                disabled={disabled || loading || isCurrent || !!plan.comingSoon}
                className={`w-full py-4 min-h-[56px] rounded-2xl font-bold text-sm transition-all active:scale-95 mt-auto
          ${isCurrent ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:opacity-90 shadow-md'}
          ${(disabled && !loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : plan.comingSoon ? "Em Breve" : isCurrent ? "Plano Atual" : "Selecionar"}
            </button>
        </div>
    );
}
