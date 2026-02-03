import { startBillingNotificationCron } from "@/cron/check-billing-notifications";
import { startSubscriptionRenewalCron } from "@/cron/renew-subscriptions";

// Inicializar cron job apenas em produção ou se variável de ambiente estiver definida
if (process.env.ENABLE_CRON === 'true' || process.env.NODE_ENV === 'production') {
    startBillingNotificationCron();
    startSubscriptionRenewalCron();
}
