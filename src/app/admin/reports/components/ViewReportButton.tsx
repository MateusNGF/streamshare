"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { ReportDetailsModal } from "./ReportDetailsModal";
import { Button } from "@/components/ui/Button";

interface ViewReportButtonProps {
    report: any; // Using any for simplicity as previously seen, but ideally should be typed
}

export function ViewReportButton({ report }: ViewReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-full text-gray-400 hover:text-primary hover:bg-violet-50 transition-colors"
                title="Ver detalhes"
            >
                <Eye size={18} />
            </button>

            <ReportDetailsModal
                report={report}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <Button
                    className="w-full sm:w-auto"
                    onClick={() => setIsOpen(false)}
                >
                    Fechar
                </Button>
            </ReportDetailsModal>

        </>
    );
}
