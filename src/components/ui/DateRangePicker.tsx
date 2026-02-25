"use client";

import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { DateRange, DayPicker } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface DateRangePickerProps {
    value?: DateRange;
    onChange?: (range: DateRange | undefined) => void;
    className?: string;
    placeholder?: string;
}

// Simple hook for mobile detection
function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

export function DateRangePicker({
    value,
    onChange,
    className,
    placeholder = "Selecionar período"
}: DateRangePickerProps) {
    const [open, setOpen] = React.useState(false);
    const isMobile = useIsMobile();

    const presets = [
        { label: "Hoje", range: { from: startOfDay(new Date()), to: endOfDay(new Date()) } },
        { label: "Ontem", range: { from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) } },
        { label: "Últimos 7 dias", range: { from: subDays(new Date(), 6), to: new Date() } },
        { label: "Últimos 30 dias", range: { from: subDays(new Date(), 29), to: new Date() } },
        { label: "Este mês", range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
    ];

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(undefined);
    };

    const renderPresets = (layout: "horizontal" | "vertical") => (
        <div className={cn(
            "flex gap-2 min-h-fit",
            layout === "horizontal" ? "flex-row overflow-x-auto pb-4 px-4 -mx-4 no-scrollbar" : "flex-col p-4 bg-gray-50/50"
        )}>
            {layout === "vertical" && (
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-2 mb-1">Períodos Sugeridos</span>
            )}
            {presets.map((preset) => (
                <button
                    key={preset.label}
                    onClick={() => {
                        onChange?.(preset.range);
                        setOpen(false);
                    }}
                    className={cn(
                        "text-xs font-bold transition-smooth whitespace-nowrap",
                        layout === "horizontal"
                            ? "px-5 py-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-primary/10 hover:text-primary active:scale-95"
                            : "text-left px-4 py-2.5 text-gray-600 hover:bg-white hover:text-primary hover:shadow-sm rounded-xl"
                    )}
                >
                    {preset.label}
                </button>
            ))}
        </div>
    );

    const renderCalendar = (isMobileView: boolean) => (
        <div className={cn("bg-white flex flex-col items-center shrink-0", isMobileView ? "p-0" : "p-6")}>
            <DayPicker
                id="date-range"
                mode="range"
                defaultMonth={value?.from}
                selected={value}
                onSelect={onChange}
                numberOfMonths={1}
                locale={ptBR}
                fixedWeeks
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    month_caption: "flex justify-center pt-1 relative items-center mb-4",
                    caption_label: "text-sm font-bold text-gray-900 capitalize",
                    nav: "space-x-1 flex items-center absolute right-0",
                    button_previous: cn(
                        "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl hover:bg-gray-100"
                    ),
                    button_next: cn(
                        "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl hover:bg-gray-100"
                    ),
                    month_grid: "w-full border-collapse space-y-1",
                    weekdays: "flex",
                    weekday: "text-gray-400 w-10 sm:w-9 font-bold text-[10px] uppercase tracking-widest text-center py-2",
                    week: "flex w-full mt-1.5",
                    day: "h-10 w-10 sm:h-9 sm:w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                    day_button: cn(
                        "h-10 w-10 sm:h-9 sm:w-9 p-0 font-medium aria-selected:opacity-100 hover:bg-gray-100 rounded-xl transition-smooth flex items-center justify-center cursor-pointer text-gray-700"
                    ),
                    range_start: "day-range-start",
                    range_end: "day-range-end",
                    selected: "day-selected",
                    today: "text-primary font-black",
                    outside: "text-gray-300 opacity-30",
                    disabled: "text-gray-300 opacity-50 cursor-not-allowed",
                    range_middle: "aria-selected:bg-primary/5 aria-selected:text-primary day-range-middle",
                    hidden: "invisible",
                }}
                components={{
                    Chevron: ({ orientation }) => {
                        const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
                        return <Icon className="h-5 w-5 sm:h-4 sm:w-4" />;
                    }
                }}
            />

            <style>{`
                .day-selected .rdp-day_button {
                    background-color: #6d28d9 !important;
                    color: white !important;
                    border-radius: 12px !important;
                    font-weight: 700 !important;
                    box-shadow: 0 8px 16px -4px rgba(109, 40, 217, 0.4) !important;
                }
                .day-range-middle .rdp-day_button {
                    background-color: transparent !important;
                    border-radius: 0 !important;
                    font-weight: 500 !important;
                    color: #6d28d9 !important;
                }
                .day-range-middle {
                    background-color: #f5f3ff !important;
                    color: #6d28d9 !important;
                }
                .day-range-start {
                    background-color: #f5f3ff !important;
                    border-radius: 12px 0 0 12px !important;
                }
                .day-range-end {
                    background-color: #f5f3ff !important;
                    border-radius: 0 12px 12px 0 !important;
                }
                .day-range-start.day-range-end {
                    border-radius: 12px !important;
                    background-color: transparent !important;
                }
                .rdp-day_today {
                    position: relative;
                }
                .rdp-day_today::after {
                    content: "";
                    position: absolute;
                    bottom: 6px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: #6d28d9;
                }
                .day-selected .rdp-day_today::after {
                    background-color: white;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );

    const trigger = (
        <button
            onClick={() => setOpen(true)}
            className={cn(
                "flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl text-left text-sm font-medium transition-smooth hover:bg-gray-50 hover:border-gray-200 shadow-sm w-full",
                !value && "text-gray-400",
                value && "border-primary/30 bg-primary/5 text-primary"
            )}
        >
            <CalendarIcon size={18} className={cn("shrink-0", value ? "text-primary" : "text-gray-400")} />
            <span className="truncate flex-1">
                {value?.from ? (
                    value.to ? (
                        <>
                            {format(value.from, "dd MMM yyyy", { locale: ptBR })} - {format(value.to, "dd MMM yyyy", { locale: ptBR })}
                        </>
                    ) : (
                        format(value.from, "dd MMM yyyy", { locale: ptBR })
                    )
                ) : (
                    placeholder
                )}
            </span>
            {value && (
                <div
                    className="p-1 hover:bg-red-50 rounded-md group transition-colors"
                    onClick={handleClear}
                >
                    <X size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                </div>
            )}
        </button>
    );

    if (isMobile) {
        return (
            <div className={cn("grid gap-2", className)}>
                {trigger}
                <Modal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    title="Selecionar Período"
                    className="sm:max-w-md"
                    footer={
                        <Button
                            className="w-full h-14 rounded-2xl text-base font-black shadow-xl shadow-primary/30 transition-smooth active:scale-95"
                            onClick={() => setOpen(false)}
                        >
                            Confirmar Seleção
                        </Button>
                    }
                >
                    <div className="flex flex-col gap-6">
                        {/* Mobile Header Data Summary */}
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-primary/60 tracking-wider mb-1">Início</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {value?.from ? format(value.from, "dd 'de' MMMM", { locale: ptBR }) : "Não definido"}
                                </span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[10px] uppercase font-black text-primary/60 tracking-wider mb-1">Fim</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {value?.to ? format(value.to, "dd 'de' MMMM", { locale: ptBR }) : "Aguardando..."}
                                </span>
                            </div>
                        </div>

                        {/* Presets Horizontal Carousel */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Atalhos rápidos</span>
                            {renderPresets("horizontal")}
                        </div>

                        {/* Calendar Grid */}
                        <div className="flex justify-center border-t border-gray-100 pt-6">
                            {renderCalendar(true)}
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                    {trigger}
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        className="z-[9999] bg-white rounded-[28px] shadow-2xl border border-gray-100 p-0 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300"
                        align="start"
                        sideOffset={8}
                    >
                        <div className="flex flex-row divide-x divide-gray-100">
                            {renderPresets("vertical")}
                            <div className="p-2">
                                {renderCalendar(false)}
                            </div>
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
}
