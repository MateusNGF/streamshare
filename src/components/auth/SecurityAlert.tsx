import { AlertCircle } from "lucide-react";

interface SecurityAlertProps {
    message: string | null;
}

export function SecurityAlert({ message }: SecurityAlertProps) {
    if (!message) return null;

    return (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="p-1 bg-amber-100 rounded-full text-amber-600 mt-0.5">
                <AlertCircle size={16} />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-900">Atenção</h4>
                <p className="text-xs text-amber-800 mt-0.5">{message}</p>
            </div>
        </div>
    );
}
