'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';

export function FeedbackWidget() {
    const [submitted, setSubmitted] = useState<boolean>(false);

    const handleFeedback = (isHelpful: boolean) => {
        // Here you would connect to an API or Google Analytics
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">Obrigado pelo seu feedback! Isso ajuda-nos a melhorar.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4 mt-8">
            <p className="text-sm font-medium text-gray-700">
                Este artigo foi útil?
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleFeedback(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-violet-600 transition-colors"
                >
                    <ThumbsUp className="w-4 h-4" />
                    Sim
                </button>
                <button
                    onClick={() => handleFeedback(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-rose-600 transition-colors"
                >
                    <ThumbsDown className="w-4 h-4" />
                    Não
                </button>
            </div>
        </div>
    );
}
