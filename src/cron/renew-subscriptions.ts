import cron from 'node-cron';
import { billingService } from "@/services/billing-service";

/**
 * Initializes the cron job to automatically renew subscriptions.
 * Runs weekly (Mondays) at 8:00 AM.
 * 
 * Unlike the manual action, this runs for ALL accounts in the system.
 */
export function startSubscriptionRenewalCron() {
    // Schedule: Daily at 8:00 AM
    cron.schedule('0 4 * * *', async () => {
        console.log('[CRON] Iniciando renovação automática de assinaturas...');
        try {
            const result = await billingService.processarCicloCobranca();

            if ('skipped' in result) {
                console.log('[CRON] Ciclo de cobrança ignorado: Outra execução em andamento.');
                return;
            }

            const renovadas = result.streamings?.renovadas || 0;

            if (renovadas > 0) {
                console.log(`[CRON] Renovação concluída: ${renovadas} novas cobranças geradas.`);
            } else {
                console.log('[CRON] Nenhuma assinatura precisou ser renovada hoje.');
            }
        } catch (error) {
            console.error('[CRON] Erro crítico na renovação de assinaturas:', error);
        }
    });

    console.log('✅ Subscription renewal cron job initialized (runs weekly on Mondays at 4:00 AM)');
}
