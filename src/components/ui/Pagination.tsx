import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
}: PaginationProps) {
    // If no items, don't render pagination
    if (totalItems === 0) return null;

    const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push("ellipsis-start");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("ellipsis-end");
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages.map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
                return (
                    <span key={`ellipsis-${index}`} className="flex items-center justify-center w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                    </span>
                );
            }

            return (
                <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className={`h-9 w-9 rounded-lg cursor-pointer transition-all ${currentPage === page
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                        : "hover:bg-accent hover:text-accent-foreground"
                        } ${currentPage === page ? "pointer-events-none" : ""}`}
                    onClick={() => onPageChange(Number(page))}
                >
                    {page}
                </Button>
            );
        });
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mt-4 border-t px-2">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Mostrando <span className="font-medium text-foreground">{startItem}</span>-{Math.min(endItem, totalItems)} de{" "}
                <span className="font-medium text-foreground">{totalItems}</span> resultados
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg cursor-pointer"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Página anterior</span>
                </Button>

                <div className="flex items-center gap-1">
                    {renderPageNumbers()}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg cursor-pointer"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Próxima página</span>
                </Button>
            </div>
        </div>
    );
}
