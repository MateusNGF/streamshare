"use client";

import { useState, useRef, useCallback } from "react";

export function useOtpInput(length: number = 6) {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    /**
     * Focuses an input by index, safely.
     */
    const focusAt = useCallback((index: number) => {
        inputRefs.current[index]?.focus();
    }, []);

    /**
     * Fills OTP starting at a given index from a string of digits.
     * Returns the index of the last filled cell.
     */
    const fillFrom = useCallback((startIndex: number, digits: string) => {
        setOtp((prev) => {
            const next = [...prev];
            let lastFilled = startIndex;
            for (let i = 0; i < digits.length && startIndex + i < length; i++) {
                const char = digits[i];
                if (/^\d$/.test(char)) {
                    next[startIndex + i] = char;
                    lastFilled = startIndex + i;
                }
            }
            return next;
        });
        // Focus after state update — use setTimeout to let React flush first
        const targetIndex = Math.min(startIndex + digits.length, length - 1);
        setTimeout(() => focusAt(targetIndex), 0);
    }, [length, focusAt]);

    /**
     * Handles single character input changes (digit by digit).
     */
    const handleOtpChange = useCallback((index: number, value: string) => {
        // Filter to only digits. 
        // If user types over an existing digit, we want the NEWEST digit.
        const digit = value.replace(/\D/g, "").slice(-1);

        if (!digit) {
            // If empty (e.g. deleted), just update state
            setOtp((prev) => {
                const next = [...prev];
                next[index] = "";
                return next;
            });
            return;
        }

        // Update current digit
        setOtp((prev) => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });

        // Instant focus move for better accessibility
        if (index < length - 1) {
            focusAt(index + 1);
        }
    }, [length, focusAt]);

    /**
     * Handles paste event — fills all cells from pasted value.
     * This is necessary because maxLength={1} blocks onChange from receiving multiple chars.
     */
    const handleOtpPaste = useCallback((index: number, e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (!pasted) return;
        fillFrom(index, pasted);
    }, [length, fillFrom]);

    /**
     * Handles keyboard navigation between cells.
     */
    const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            setOtp((prev) => {
                const next = [...prev];
                if (next[index] !== "") {
                    // Clear current cell first
                    next[index] = "";
                    return next;
                }
                // Already empty — back to previous
                if (index > 0) {
                    next[index - 1] = "";
                    setTimeout(() => focusAt(index - 1), 0);
                }
                return next;
            });
        } else if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            focusAt(index - 1);
        } else if (e.key === "ArrowRight" && index < length - 1) {
            e.preventDefault();
            focusAt(index + 1);
        }
    }, [length, focusAt]);

    /**
     * Resets OTP to empty and focuses first cell.
     */
    const resetOtp = useCallback(() => {
        setOtp(new Array(length).fill(""));
        setTimeout(() => focusAt(0), 0);
    }, [length, focusAt]);

    const getOtpValue = useCallback(() => otp.join(""), [otp]);
    const isComplete = otp.every((digit) => digit !== "");

    return {
        otp,
        inputRefs,
        handleOtpChange,
        handleOtpKeyDown,
        handleOtpPaste,
        resetOtp,
        getOtpValue,
        isComplete
    };
}
