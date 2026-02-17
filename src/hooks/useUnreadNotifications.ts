import { useState, useEffect } from "react";
import { getNotificacoes } from "@/actions/notificacoes";

export function useUnreadNotifications() {
    const [unreadCount, setUnreadCount] = useState(0);

    const loadUnreadCount = async () => {
        try {
            const result = await getNotificacoes({ limite: 1 });
            if (result.success && result.data) {
                setUnreadCount(result.data.naoLidas);
            }
        } catch (error) {
            console.error("Failed to load notification count", error);
        }
    };

    useEffect(() => {
        loadUnreadCount();

        // Refresh count every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const refreshCount = async () => {
        await loadUnreadCount();
    };

    return { unreadCount, refreshCount };
}
