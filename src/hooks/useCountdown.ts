"use client";

import { useState, useEffect, useCallback } from "react";

export function useCountdown(initialSeconds: number = 60) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prev) => prev - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const resetCountdown = useCallback((newSeconds?: number) => {
        setSeconds(newSeconds ?? initialSeconds);
        setIsActive(true);
    }, [initialSeconds]);

    const stopCountdown = useCallback(() => {
        setIsActive(false);
    }, []);

    return {
        seconds,
        isActive,
        resetCountdown,
        stopCountdown
    };
}
