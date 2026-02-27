"use client";

import { useState, useRef } from "react";
import { HelpCircle, X, GripVertical } from "lucide-react";
import { SupportModal } from "./SupportModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function SupportButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const constraintsRef = useRef(null);

    if (!isVisible) return null;

    return (
        <>
            {/* Constraints container (full screen to allow dragging anywhere) */}
            <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        drag
                        dragConstraints={constraintsRef}
                        dragElastic={0.1}
                        dragMomentum={false}
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 50 }}
                        whileHover={{ scale: 1.05 }}
                        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
                        className="fixed bottom-6 right-6 z-50 pointer-events-auto"
                    >
                        <div className="relative group">
                            {/* Dismiss Button - Small, subtle, only visible on hover */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsVisible(false);
                                }}
                                className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-1 shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                title="Dispensar suporte"
                            >
                                <X size={12} strokeWidth={3} />
                            </button>

                            {/* Drag Indicator - Shows up on hover */}
                            <div className="absolute top-1/2 -left-3 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity text-gray-400">
                                <GripVertical size={16} />
                            </div>

                            {/* Main Support Button */}
                            <button
                                onClick={() => setIsOpen(true)}
                                className={cn(
                                    "p-4 bg-primary text-white rounded-full shadow-2xl shadow-primary/40",
                                    "hover:shadow-primary/50 transition-all duration-300",
                                    "flex items-center justify-center group/btn"
                                )}
                                aria-label="Suporte"
                            >
                                <HelpCircle size={28} className="group-hover/btn:rotate-12 transition-transform duration-500" />

                                {/* Tooltip or Label - Only on large screens hover */}
                                <span className="absolute right-full mr-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10 translate-x-2 group-hover:translate-x-0 duration-300">
                                    Precisa de ajuda?
                                </span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SupportModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
