"use client";

import { ComingSoon } from "@/components/ui/ComingSoon";

export default function NotificationsTab() {
    return (
        <ComingSoon
            title="Em breve"
            description="Estamos preparando um novo centro de notificações inteligente."
            tags={["WhatsApp", "Email", "SMS", "Telegram", "Discord"]}
        />
    );
}
