"use client";

import { StreamingOption, SelectedStreaming } from "../types";
import { StreamingConfigItem } from "./StreamingConfigItem";

interface StepConfigurationProps {
    selectedStreamings: StreamingOption[];
    configurations: Map<number, SelectedStreaming>;
    onUpdate: (id: number, field: keyof SelectedStreaming, value: any) => void;
}

export function StepConfiguration({
    selectedStreamings,
    configurations,
    onUpdate
}: StepConfigurationProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Configure os Valores</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Defina o valor base <strong>mensal</strong> e a frequência de faturamento para cada serviço.
                </p>
            </div>

            <div className="space-y-4">
                {selectedStreamings.map(streaming => (
                    <StreamingConfigItem
                        key={streaming.id}
                        streaming={streaming}
                        config={configurations.get(streaming.id)}
                        onUpdate={onUpdate}
                    />
                ))}
            </div>
        </div>
    );
}
